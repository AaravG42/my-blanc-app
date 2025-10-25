// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./BlancToken.sol";
import "./BlancProfile.sol";

contract BlancPosts {
    BlancToken public blancToken;
    BlancProfile public blancProfile;
    
    struct Post {
        uint256 id;
        address creator;
        address[] participants;
        string ipfsHash;
        string caption;
        uint256 timestamp;
        bool isPublic;
        uint256 requiredVerifications;
        mapping(address => bool) hasVerified;
        address[] verifiedBy;
        uint256 likes;
        uint256 comments;
        uint256 shares;
        bool isActive;
    }
    
    mapping(uint256 => Post) public posts;
    mapping(address => uint256[]) public userPosts;
    mapping(address => uint256[]) public userCollaborations;
    mapping(uint256 => mapping(address => bool)) public hasLiked;
    
    uint256 public postCounter;
    
    event PostCreated(
        uint256 indexed id,
        address indexed creator,
        address[] participants,
        string ipfsHash,
        bool isPublic
    );
    
    event PostVerified(
        uint256 indexed id,
        address indexed verifier,
        uint256 verificationCount
    );
    
    event PostFullyVerified(uint256 indexed id);
    
    event PostLiked(uint256 indexed id, address indexed liker);
    event PostUnliked(uint256 indexed id, address indexed unliker);
    event PostCommented(uint256 indexed id, address indexed commenter);
    event PostShared(uint256 indexed id, address indexed sharer);
    
    constructor(address _blancToken, address _blancProfile) {
        blancToken = BlancToken(_blancToken);
        blancProfile = BlancProfile(_blancProfile);
    }
    
    function createPost(
        address[] memory participants,
        string memory ipfsHash,
        string memory caption,
        bool isPublic
    ) external returns (uint256) {
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        
        postCounter++;
        uint256 postId = postCounter;
        
        Post storage newPost = posts[postId];
        newPost.id = postId;
        newPost.creator = msg.sender;
        newPost.participants = participants;
        newPost.ipfsHash = ipfsHash;
        newPost.caption = caption;
        newPost.timestamp = block.timestamp;
        newPost.isPublic = isPublic;
        newPost.likes = 0;
        newPost.comments = 0;
        newPost.shares = 0;
        
        if (participants.length == 0) {
            newPost.requiredVerifications = 0;
            newPost.isActive = true;
            blancToken.mintReward(msg.sender, blancToken.REWARD_PER_POST(), "solo_post");
        } else {
            newPost.requiredVerifications = participants.length;
            newPost.isActive = false;
        }
        
        userPosts[msg.sender].push(postId);
        
        emit PostCreated(postId, msg.sender, participants, ipfsHash, isPublic);
        
        return postId;
    }
    
    function verifyPost(uint256 postId) external {
        require(postId > 0 && postId <= postCounter, "Invalid post ID");
        Post storage post = posts[postId];
        require(!post.isActive, "Post already active");
        require(!post.hasVerified[msg.sender], "Already verified");
        
        bool isParticipant = false;
        for (uint256 i = 0; i < post.participants.length; i++) {
            if (post.participants[i] == msg.sender) {
                isParticipant = true;
                break;
            }
        }
        require(isParticipant, "Not a participant");
        
        post.hasVerified[msg.sender] = true;
        post.verifiedBy.push(msg.sender);
        
        userCollaborations[msg.sender].push(postId);
        
        emit PostVerified(postId, msg.sender, post.verifiedBy.length);
        
        if (post.verifiedBy.length == post.requiredVerifications) {
            post.isActive = true;
            
            blancToken.mintReward(post.creator, blancToken.REWARD_PER_POST(), "collab_post");
            for (uint256 i = 0; i < post.verifiedBy.length; i++) {
                blancToken.mintReward(post.verifiedBy[i], blancToken.REWARD_PER_VERIFICATION(), "verification");
            }
            
            emit PostFullyVerified(postId);
        }
    }
    
    function likePost(uint256 postId) external {
        require(postId > 0 && postId <= postCounter, "Invalid post ID");
        Post storage post = posts[postId];
        require(post.isActive, "Post not active");
        require(!hasLiked[postId][msg.sender], "Already liked");
        
        hasLiked[postId][msg.sender] = true;
        post.likes++;
        
        blancProfile.increaseReputation(post.creator, 1);
        
        emit PostLiked(postId, msg.sender);
    }
    
    function unlikePost(uint256 postId) external {
        require(postId > 0 && postId <= postCounter, "Invalid post ID");
        require(hasLiked[postId][msg.sender], "Not liked");
        
        Post storage post = posts[postId];
        hasLiked[postId][msg.sender] = false;
        post.likes--;
        
        emit PostUnliked(postId, msg.sender);
    }
    
    function commentPost(uint256 postId) external {
        require(postId > 0 && postId <= postCounter, "Invalid post ID");
        Post storage post = posts[postId];
        require(post.isActive, "Post not active");
        
        post.comments++;
        
        blancProfile.increaseReputation(post.creator, 2);
        
        emit PostCommented(postId, msg.sender);
    }
    
    function sharePost(uint256 postId) external {
        require(postId > 0 && postId <= postCounter, "Invalid post ID");
        Post storage post = posts[postId];
        require(post.isActive, "Post not active");
        
        post.shares++;
        
        blancProfile.increaseReputation(post.creator, 3);
        
        emit PostShared(postId, msg.sender);
    }
    
    function getPost(uint256 postId) external view returns (
        uint256 id,
        address creator,
        address[] memory participants,
        string memory ipfsHash,
        string memory caption,
        uint256 timestamp,
        bool isPublic,
        address[] memory verifiedBy,
        uint256 likes,
        uint256 commentsCount,
        uint256 sharesCount,
        bool isActive
    ) {
        Post storage post = posts[postId];
        return (
            post.id,
            post.creator,
            post.participants,
            post.ipfsHash,
            post.caption,
            post.timestamp,
            post.isPublic,
            post.verifiedBy,
            post.likes,
            post.comments,
            post.shares,
            post.isActive
        );
    }
    
    function getUserPosts(address user) external view returns (uint256[] memory) {
        return userPosts[user];
    }
    
    function getUserCollaborations(address user) external view returns (uint256[] memory) {
        return userCollaborations[user];
    }
    
    function hasUserLiked(uint256 postId, address user) external view returns (bool) {
        return hasLiked[postId][user];
    }
    
    function getVerificationStatus(uint256 postId) external view returns (
        uint256 verified,
        uint256 required,
        address[] memory verifiers
    ) {
        Post storage post = posts[postId];
        return (post.verifiedBy.length, post.requiredVerifications, post.verifiedBy);
    }
}

