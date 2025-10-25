//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "forge-std/console.sol";

contract BlancInteractions {
    struct Interaction {
        uint256 id;
        address initiator;
        address verifier;
        string ipfsHash;
        string caption;
        uint256 timestamp;
        bool verified;
        uint256 tipAmount;
    }

    mapping(uint256 => Interaction) public interactions;
    mapping(address => uint256[]) public userInteractions;
    mapping(address => uint256) public verifiedCount;

    uint256 public interactionCounter;
    
    event InteractionCreated(
        uint256 indexed id,
        address indexed initiator,
        string ipfsHash,
        string caption
    );
    
    event InteractionVerified(
        uint256 indexed id,
        address indexed verifier
    );
    
    event InteractionTipped(
        uint256 indexed id,
        address indexed tipper,
        uint256 amount
    );

    function createInteraction(string memory ipfsHash, string memory caption) public returns (uint256) {
        interactionCounter++;
        
        Interaction storage newInteraction = interactions[interactionCounter];
        newInteraction.id = interactionCounter;
        newInteraction.initiator = msg.sender;
        newInteraction.ipfsHash = ipfsHash;
        newInteraction.caption = caption;
        newInteraction.timestamp = block.timestamp;
        newInteraction.verified = false;
        newInteraction.tipAmount = 0;
        
        userInteractions[msg.sender].push(interactionCounter);
        
        emit InteractionCreated(interactionCounter, msg.sender, ipfsHash, caption);
        
        return interactionCounter;
    }

    function verifyInteraction(uint256 interactionId) public {
        require(interactionId > 0 && interactionId <= interactionCounter, "Invalid interaction ID");
        require(!interactions[interactionId].verified, "Already verified");
        require(interactions[interactionId].initiator != msg.sender, "Cannot verify your own interaction");
        
        interactions[interactionId].verifier = msg.sender;
        interactions[interactionId].verified = true;
        
        verifiedCount[interactions[interactionId].initiator]++;
        verifiedCount[msg.sender]++;
        
        userInteractions[msg.sender].push(interactionId);
        
        emit InteractionVerified(interactionId, msg.sender);
    }

    function tipInteraction(uint256 interactionId) public payable {
        require(interactionId > 0 && interactionId <= interactionCounter, "Invalid interaction ID");
        require(msg.value > 0, "Tip amount must be greater than 0");
        
        interactions[interactionId].tipAmount += msg.value;
        
        address recipient = interactions[interactionId].initiator;
        if (interactions[interactionId].verified) {
            recipient = interactions[interactionId].verifier;
        }
        
        (bool success, ) = payable(recipient).call{value: msg.value}("");
        require(success, "Transfer failed");
        
        emit InteractionTipped(interactionId, msg.sender, msg.value);
    }

    function getInteraction(uint256 id) public view returns (
        uint256,
        address,
        address,
        string memory,
        string memory,
        uint256,
        bool,
        uint256
    ) {
        Interaction memory interaction = interactions[id];
        return (
            interaction.id,
            interaction.initiator,
            interaction.verifier,
            interaction.ipfsHash,
            interaction.caption,
            interaction.timestamp,
            interaction.verified,
            interaction.tipAmount
        );
    }

    function getUserInteractions(address user) public view returns (uint256[] memory) {
        return userInteractions[user];
    }

    function getVerifiedInteractionsCount(address user) public view returns (uint256) {
        return verifiedCount[user];
    }

    function getInteractionCounter() public view returns (uint256) {
        return interactionCounter;
    }

    receive() external payable {}
}
