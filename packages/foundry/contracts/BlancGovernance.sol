// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./BlancToken.sol";

contract BlancGovernance {
    BlancToken public blancToken;
    
    struct AlgorithmParams {
        uint256 recencyWeight;
        uint256 engagementWeight;
        uint256 reputationWeight;
    }
    
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 newRecencyWeight;
        uint256 newEngagementWeight;
        uint256 newReputationWeight;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) voteAmount;
    }
    
    AlgorithmParams public currentParams;
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCounter;
    
    uint256 public constant VOTING_PERIOD = 3 days;
    uint256 public constant MIN_PROPOSAL_TOKENS = 1 * 10**18;
    uint256 public constant WEIGHT_SUM = 100;
    
    event ProposalCreated(
        uint256 indexed id,
        address indexed proposer,
        string description,
        uint256 recency,
        uint256 engagement,
        uint256 reputation
    );
    
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 amount);
    event ProposalExecuted(uint256 indexed proposalId);
    event ParamsUpdated(uint256 recency, uint256 engagement, uint256 reputation);
    
    constructor(address _blancToken) {
        blancToken = BlancToken(_blancToken);
        
        currentParams = AlgorithmParams({
            recencyWeight: 40,
            engagementWeight: 35,
            reputationWeight: 25
        });
    }
    
    function createProposal(
        string memory description,
        uint256 newRecencyWeight,
        uint256 newEngagementWeight,
        uint256 newReputationWeight
    ) external returns (uint256) {
        require(
            blancToken.balanceOf(msg.sender) >= MIN_PROPOSAL_TOKENS,
            "Insufficient tokens to propose"
        );
        require(
            newRecencyWeight + newEngagementWeight + newReputationWeight == WEIGHT_SUM,
            "Weights must sum to 100"
        );
        
        proposalCounter++;
        uint256 proposalId = proposalCounter;
        
        Proposal storage newProposal = proposals[proposalId];
        newProposal.id = proposalId;
        newProposal.proposer = msg.sender;
        newProposal.description = description;
        newProposal.newRecencyWeight = newRecencyWeight;
        newProposal.newEngagementWeight = newEngagementWeight;
        newProposal.newReputationWeight = newReputationWeight;
        newProposal.votesFor = 0;
        newProposal.votesAgainst = 0;
        newProposal.startTime = block.timestamp;
        newProposal.endTime = block.timestamp + VOTING_PERIOD;
        newProposal.executed = false;
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            description,
            newRecencyWeight,
            newEngagementWeight,
            newReputationWeight
        );
        
        return proposalId;
    }
    
    function vote(uint256 proposalId, bool support) external {
        require(proposalId > 0 && proposalId <= proposalCounter, "Invalid proposal");
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp < proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        uint256 votingPower = blancToken.balanceOf(msg.sender);
        require(votingPower > 0, "No voting power");
        
        proposal.hasVoted[msg.sender] = true;
        proposal.voteAmount[msg.sender] = votingPower;
        
        if (support) {
            proposal.votesFor += votingPower;
        } else {
            proposal.votesAgainst += votingPower;
        }
        
        emit Voted(proposalId, msg.sender, support, votingPower);
    }
    
    function executeProposal(uint256 proposalId) external {
        require(proposalId > 0 && proposalId <= proposalCounter, "Invalid proposal");
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.endTime, "Voting not ended");
        require(!proposal.executed, "Already executed");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal rejected");
        
        proposal.executed = true;
        
        currentParams.recencyWeight = proposal.newRecencyWeight;
        currentParams.engagementWeight = proposal.newEngagementWeight;
        currentParams.reputationWeight = proposal.newReputationWeight;
        
        emit ProposalExecuted(proposalId);
        emit ParamsUpdated(
            proposal.newRecencyWeight,
            proposal.newEngagementWeight,
            proposal.newReputationWeight
        );
    }
    
    function getProposal(uint256 proposalId) external view returns (
        uint256 id,
        address proposer,
        string memory description,
        uint256 newRecencyWeight,
        uint256 newEngagementWeight,
        uint256 newReputationWeight,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 startTime,
        uint256 endTime,
        bool executed
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.id,
            proposal.proposer,
            proposal.description,
            proposal.newRecencyWeight,
            proposal.newEngagementWeight,
            proposal.newReputationWeight,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.startTime,
            proposal.endTime,
            proposal.executed
        );
    }
    
    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }
    
    function getCurrentParams() external view returns (
        uint256 recency,
        uint256 engagement,
        uint256 reputation
    ) {
        return (
            currentParams.recencyWeight,
            currentParams.engagementWeight,
            currentParams.reputationWeight
        );
    }
}

