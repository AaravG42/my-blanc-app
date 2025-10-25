// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract BlancProfile {
    struct Profile {
        string username;
        string bio;
        string profilePicHash;
        uint256 reputation;
        uint256 joinedAt;
        bool exists;
    }
    
    mapping(address => Profile) public profiles;
    mapping(string => address) public usernameToAddress;
    mapping(address => mapping(address => bool)) public following;
    mapping(address => uint256) public followerCount;
    mapping(address => uint256) public followingCount;
    
    event ProfileCreated(address indexed user, string username);
    event ProfileUpdated(address indexed user);
    event ReputationUpdated(address indexed user, uint256 newReputation);
    event Followed(address indexed follower, address indexed followee);
    event Unfollowed(address indexed follower, address indexed followee);
    
    modifier profileExists(address user) {
        require(profiles[user].exists, "Profile does not exist");
        _;
    }
    
    function createProfile(string memory username, string memory bio, string memory profilePicHash) external {
        require(!profiles[msg.sender].exists, "Profile already exists");
        require(bytes(username).length > 0 && bytes(username).length <= 32, "Invalid username length");
        require(usernameToAddress[username] == address(0), "Username taken");
        
        profiles[msg.sender] = Profile({
            username: username,
            bio: bio,
            profilePicHash: profilePicHash,
            reputation: 0,
            joinedAt: block.timestamp,
            exists: true
        });
        
        usernameToAddress[username] = msg.sender;
        
        emit ProfileCreated(msg.sender, username);
    }
    
    function updateProfile(string memory bio, string memory profilePicHash) external profileExists(msg.sender) {
        profiles[msg.sender].bio = bio;
        profiles[msg.sender].profilePicHash = profilePicHash;
        
        emit ProfileUpdated(msg.sender);
    }
    
    function increaseReputation(address user, uint256 amount) external {
        require(profiles[user].exists, "Profile does not exist");
        profiles[user].reputation += amount;
        emit ReputationUpdated(user, profiles[user].reputation);
    }
    
    function follow(address userToFollow) external profileExists(msg.sender) profileExists(userToFollow) {
        require(msg.sender != userToFollow, "Cannot follow yourself");
        require(!following[msg.sender][userToFollow], "Already following");
        
        following[msg.sender][userToFollow] = true;
        followerCount[userToFollow]++;
        followingCount[msg.sender]++;
        
        emit Followed(msg.sender, userToFollow);
    }
    
    function unfollow(address userToUnfollow) external profileExists(msg.sender) {
        require(following[msg.sender][userToUnfollow], "Not following");
        
        following[msg.sender][userToUnfollow] = false;
        followerCount[userToUnfollow]--;
        followingCount[msg.sender]--;
        
        emit Unfollowed(msg.sender, userToUnfollow);
    }
    
    function getProfile(address user) external view returns (
        string memory username,
        string memory bio,
        string memory profilePicHash,
        uint256 reputation,
        uint256 joinedAt
    ) {
        Profile memory profile = profiles[user];
        require(profile.exists, "Profile does not exist");
        
        return (
            profile.username,
            profile.bio,
            profile.profilePicHash,
            profile.reputation,
            profile.joinedAt
        );
    }
    
    function getProfileStats(address user) external view returns (
        uint256 followers,
        uint256 followingNum
    ) {
        require(profiles[user].exists, "Profile does not exist");
        return (followerCount[user], followingCount[user]);
    }
    
    function isFollowing(address follower, address followee) external view returns (bool) {
        return following[follower][followee];
    }
}

