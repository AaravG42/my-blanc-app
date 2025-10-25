// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract BlancPayments {
    struct PaymentSplit {
        uint256 postId;
        uint256 totalAmount;
        address[] recipients;
        uint256[] percentages;
        mapping(address => bool) hasClaimed;
        bool isActive;
        uint256 createdAt;
    }
    
    mapping(uint256 => PaymentSplit) public paymentSplits;
    mapping(address => uint256) public pendingWithdrawals;
    
    uint256 public constant PERCENTAGE_BASE = 10000;
    uint256 public constant REFUND_TIMEOUT = 7 days;
    
    event PaymentCreated(
        uint256 indexed postId,
        uint256 totalAmount,
        address[] recipients,
        uint256[] percentages
    );
    
    event PaymentActivated(uint256 indexed postId);
    event PaymentClaimed(uint256 indexed postId, address indexed recipient, uint256 amount);
    event PaymentRefunded(uint256 indexed postId, address indexed creator, uint256 amount);
    
    function createPaymentSplit(
        uint256 postId,
        address[] memory recipients,
        uint256[] memory percentages
    ) external payable {
        require(msg.value > 0, "Payment required");
        require(recipients.length > 0, "No recipients");
        require(recipients.length == percentages.length, "Length mismatch");
        require(!paymentSplits[postId].isActive && paymentSplits[postId].totalAmount == 0, "Payment exists");
        
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < percentages.length; i++) {
            totalPercentage += percentages[i];
        }
        require(totalPercentage == PERCENTAGE_BASE, "Percentages must sum to 100%");
        
        PaymentSplit storage split = paymentSplits[postId];
        split.postId = postId;
        split.totalAmount = msg.value;
        split.recipients = recipients;
        split.percentages = percentages;
        split.isActive = false;
        split.createdAt = block.timestamp;
        
        emit PaymentCreated(postId, msg.value, recipients, percentages);
    }
    
    function activatePayment(uint256 postId) external {
        PaymentSplit storage split = paymentSplits[postId];
        require(split.totalAmount > 0, "Payment does not exist");
        require(!split.isActive, "Already active");
        
        split.isActive = true;
        
        emit PaymentActivated(postId);
    }
    
    function claimPayment(uint256 postId) external {
        PaymentSplit storage split = paymentSplits[postId];
        require(split.isActive, "Payment not active");
        require(!split.hasClaimed[msg.sender], "Already claimed");
        
        bool isRecipient = false;
        uint256 recipientIndex = 0;
        for (uint256 i = 0; i < split.recipients.length; i++) {
            if (split.recipients[i] == msg.sender) {
                isRecipient = true;
                recipientIndex = i;
                break;
            }
        }
        require(isRecipient, "Not a recipient");
        
        split.hasClaimed[msg.sender] = true;
        
        uint256 amount = (split.totalAmount * split.percentages[recipientIndex]) / PERCENTAGE_BASE;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit PaymentClaimed(postId, msg.sender, amount);
    }
    
    function refundPayment(uint256 postId, address creator) external {
        PaymentSplit storage split = paymentSplits[postId];
        require(split.totalAmount > 0, "Payment does not exist");
        require(!split.isActive, "Payment is active");
        require(block.timestamp >= split.createdAt + REFUND_TIMEOUT, "Refund timeout not reached");
        
        uint256 refundAmount = split.totalAmount;
        split.totalAmount = 0;
        
        (bool success, ) = payable(creator).call{value: refundAmount}("");
        require(success, "Refund failed");
        
        emit PaymentRefunded(postId, creator, refundAmount);
    }
    
    function getPaymentInfo(uint256 postId) external view returns (
        uint256 totalAmount,
        address[] memory recipients,
        uint256[] memory percentages,
        bool isActive,
        uint256 createdAt
    ) {
        PaymentSplit storage split = paymentSplits[postId];
        return (
            split.totalAmount,
            split.recipients,
            split.percentages,
            split.isActive,
            split.createdAt
        );
    }
    
    function hasClaimed(uint256 postId, address recipient) external view returns (bool) {
        return paymentSplits[postId].hasClaimed[recipient];
    }
}

