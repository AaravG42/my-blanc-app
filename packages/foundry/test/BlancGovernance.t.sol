// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "forge-std/Test.sol";
import "../contracts/BlancGovernance.sol";
import "../contracts/BlancToken.sol";

contract BlancGovernanceTest is Test {
    BlancGovernance governance;
    BlancToken token;
    
    address proposer = address(1);
    address voter1 = address(2);
    address voter2 = address(3);
    
    function setUp() public {
        token = new BlancToken();
        governance = new BlancGovernance(address(token));
        
        token.transfer(proposer, 1000 * 10**18);
        token.transfer(voter1, 500 * 10**18);
        token.transfer(voter2, 300 * 10**18);
    }
    
    function testInitialParams() public view {
        (uint256 recency, uint256 engagement, uint256 reputation) = governance.getCurrentParams();
        assertEq(recency, 40);
        assertEq(engagement, 35);
        assertEq(reputation, 25);
    }
    
    function testCreateProposal() public {
        vm.prank(proposer);
        uint256 proposalId = governance.createProposal(
            "Increase recency weight",
            50,
            30,
            20
        );
        
        assertEq(proposalId, 1);
    }
    
    function testCannotCreateProposalWithoutTokens() public {
        address poorUser = address(10);
        
        vm.prank(poorUser);
        vm.expectRevert("Insufficient tokens to propose");
        governance.createProposal("Test", 40, 35, 25);
    }
    
    function testVote() public {
        vm.prank(proposer);
        uint256 proposalId = governance.createProposal("Test", 50, 30, 20);
        
        vm.prank(voter1);
        governance.vote(proposalId, true);
        
        assertTrue(governance.hasVoted(proposalId, voter1));
    }
    
    function testExecuteProposal() public {
        vm.prank(proposer);
        uint256 proposalId = governance.createProposal("Test", 50, 30, 20);
        
        vm.prank(voter1);
        governance.vote(proposalId, true);
        
        vm.prank(voter2);
        governance.vote(proposalId, true);
        
        vm.warp(block.timestamp + 4 days);
        
        governance.executeProposal(proposalId);
        
        (uint256 recency, uint256 engagement, uint256 reputation) = governance.getCurrentParams();
        assertEq(recency, 50);
        assertEq(engagement, 30);
        assertEq(reputation, 20);
    }
    
    function testCannotExecuteRejectedProposal() public {
        vm.prank(proposer);
        uint256 proposalId = governance.createProposal("Test", 50, 30, 20);
        
        vm.prank(voter1);
        governance.vote(proposalId, false);
        
        vm.prank(voter2);
        governance.vote(proposalId, false);
        
        vm.warp(block.timestamp + 4 days);
        
        vm.expectRevert("Proposal rejected");
        governance.executeProposal(proposalId);
    }
}

