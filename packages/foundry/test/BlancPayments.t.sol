// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "forge-std/Test.sol";
import "../contracts/BlancPayments.sol";

contract BlancPaymentsTest is Test {
    BlancPayments payments;
    
    address creator = address(1);
    address recipient1 = address(2);
    address recipient2 = address(3);
    
    function setUp() public {
        payments = new BlancPayments();
        vm.deal(creator, 10 ether);
    }
    
    function testCreatePaymentSplit() public {
        address[] memory recipients = new address[](2);
        recipients[0] = recipient1;
        recipients[1] = recipient2;
        
        uint256[] memory percentages = new uint256[](2);
        percentages[0] = 5000;
        percentages[1] = 5000;
        
        vm.prank(creator);
        payments.createPaymentSplit{value: 1 ether}(1, recipients, percentages);
        
        (uint256 totalAmount, , , bool isActive, ) = payments.getPaymentInfo(1);
        assertEq(totalAmount, 1 ether);
        assertFalse(isActive);
    }
    
    function testActivateAndClaimPayment() public {
        address[] memory recipients = new address[](2);
        recipients[0] = recipient1;
        recipients[1] = recipient2;
        
        uint256[] memory percentages = new uint256[](2);
        percentages[0] = 6000;
        percentages[1] = 4000;
        
        vm.prank(creator);
        payments.createPaymentSplit{value: 1 ether}(1, recipients, percentages);
        
        payments.activatePayment(1);
        
        uint256 balanceBefore = recipient1.balance;
        vm.prank(recipient1);
        payments.claimPayment(1);
        
        assertEq(recipient1.balance - balanceBefore, 0.6 ether);
        assertTrue(payments.hasClaimed(1, recipient1));
    }
    
    function testCannotClaimTwice() public {
        address[] memory recipients = new address[](1);
        recipients[0] = recipient1;
        
        uint256[] memory percentages = new uint256[](1);
        percentages[0] = 10000;
        
        vm.prank(creator);
        payments.createPaymentSplit{value: 1 ether}(1, recipients, percentages);
        
        payments.activatePayment(1);
        
        vm.prank(recipient1);
        payments.claimPayment(1);
        
        vm.prank(recipient1);
        vm.expectRevert("Already claimed");
        payments.claimPayment(1);
    }
    
    function testRefundAfterTimeout() public {
        address[] memory recipients = new address[](1);
        recipients[0] = recipient1;
        
        uint256[] memory percentages = new uint256[](1);
        percentages[0] = 10000;
        
        vm.prank(creator);
        payments.createPaymentSplit{value: 1 ether}(1, recipients, percentages);
        
        vm.warp(block.timestamp + 8 days);
        
        uint256 balanceBefore = creator.balance;
        payments.refundPayment(1, creator);
        
        assertEq(creator.balance - balanceBefore, 1 ether);
    }
}

