//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "forge-std/Test.sol";
import "../contracts/BlancInteractions.sol";

contract BlancInteractionsTest is Test {
    BlancInteractions public blanc;
    address public alice = address(1);
    address public bob = address(2);
    address public charlie = address(3);

    function setUp() public {
        blanc = new BlancInteractions();
    }

    function testCreateInteraction() public {
        vm.prank(alice);
        uint256 id = blanc.createInteraction("QmTest123", "Great meeting!");

        assertEq(id, 1);
        assertEq(blanc.getInteractionCounter(), 1);
        
        (
            uint256 returnedId,
            address initiator,
            address verifier,
            string memory ipfsHash,
            ,
            ,
            bool verified,
            uint256 tipAmount
        ) = blanc.getInteraction(1);

        assertEq(returnedId, 1);
        assertEq(initiator, alice);
        assertEq(verifier, address(0));
        assertEq(ipfsHash, "QmTest123");
        assertEq(verified, false);
        assertEq(tipAmount, 0);
    }

    function testVerifyInteraction() public {
        vm.startPrank(alice);
        uint256 id = blanc.createInteraction("QmTest123", "Great meeting!");
        vm.stopPrank();

        vm.prank(bob);
        blanc.verifyInteraction(id);

        (
            ,
            ,
            address verifier,
            ,
            ,
            ,
            bool verified,
            
        ) = blanc.getInteraction(id);

        assertEq(verifier, bob);
        assertEq(verified, true);
        assertEq(blanc.getVerifiedInteractionsCount(alice), 1);
        assertEq(blanc.getVerifiedInteractionsCount(bob), 1);
    }

    function test_RevertWhen_VerifyingOwnInteraction() public {
        vm.prank(alice);
        uint256 id = blanc.createInteraction("QmTest123", "Great meeting!");

        vm.prank(alice);
        vm.expectRevert();
        blanc.verifyInteraction(id);
    }

    function test_RevertWhen_VerifyingAlreadyVerified() public {
        vm.startPrank(alice);
        uint256 id = blanc.createInteraction("QmTest123", "Great meeting!");
        vm.stopPrank();

        vm.prank(bob);
        blanc.verifyInteraction(id);

        vm.prank(charlie);
        vm.expectRevert();
        blanc.verifyInteraction(id);
    }

    function testTipInteraction() public {
        vm.startPrank(alice);
        uint256 id = blanc.createInteraction("QmTest123", "Great meeting!");
        vm.stopPrank();

        vm.startPrank(bob);
        blanc.verifyInteraction(id);
        vm.deal(bob, 1 ether);
        blanc.tipInteraction{value: 0.1 ether}(id);
        vm.stopPrank();

        (,,,,,,, uint256 tipAmount) = blanc.getInteraction(id);
        assertEq(tipAmount, 0.1 ether);
    }

    function testGetUserInteractions() public {
        vm.startPrank(alice);
        blanc.createInteraction("QmTest1", "First");
        blanc.createInteraction("QmTest2", "Second");
        vm.stopPrank();

        vm.startPrank(bob);
        blanc.createInteraction("QmTest3", "Third");
        vm.stopPrank();

        uint256[] memory aliceInteractions = blanc.getUserInteractions(alice);
        assertEq(aliceInteractions.length, 2);
        assertEq(aliceInteractions[0], 1);
        assertEq(aliceInteractions[1], 2);

        uint256[] memory bobInteractions = blanc.getUserInteractions(bob);
        assertEq(bobInteractions.length, 1);
        assertEq(bobInteractions[0], 3);
    }

    function testGetVerifiedInteractionsCount() public {
        vm.startPrank(alice);
        blanc.createInteraction("QmTest1", "First");
        blanc.createInteraction("QmTest2", "Second");
        vm.stopPrank();

        vm.prank(bob);
        blanc.verifyInteraction(1);

        assertEq(blanc.getVerifiedInteractionsCount(alice), 1);
        assertEq(blanc.getVerifiedInteractionsCount(bob), 1);

        vm.prank(charlie);
        blanc.verifyInteraction(2);

        assertEq(blanc.getVerifiedInteractionsCount(alice), 2);
        assertEq(blanc.getVerifiedInteractionsCount(charlie), 1);
    }

    function testInteractionCreatedEvent() public {
        vm.prank(alice);
        vm.expectEmit(true, false, false, true);
        emit BlancInteractions.InteractionCreated(1, alice, "QmTest123", "Great meeting!");

        blanc.createInteraction("QmTest123", "Great meeting!");
    }

    function testInteractionVerifiedEvent() public {
        vm.startPrank(alice);
        uint256 id = blanc.createInteraction("QmTest123", "Great meeting!");
        vm.stopPrank();

        vm.prank(bob);
        vm.expectEmit(true, true, false, false);
        emit BlancInteractions.InteractionVerified(id, bob);

        blanc.verifyInteraction(id);
    }

    function testInteractionTippedEvent() public {
        vm.startPrank(alice);
        uint256 id = blanc.createInteraction("QmTest123", "Great meeting!");
        vm.stopPrank();

        vm.startPrank(bob);
        blanc.verifyInteraction(id);
        vm.deal(bob, 1 ether);

        vm.expectEmit(true, true, false, true);
        emit BlancInteractions.InteractionTipped(id, bob, 0.1 ether);

        blanc.tipInteraction{value: 0.1 ether}(id);
        vm.stopPrank();
    }
}
