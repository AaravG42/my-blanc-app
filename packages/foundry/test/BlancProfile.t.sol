// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "forge-std/Test.sol";
import "../contracts/BlancProfile.sol";

contract BlancProfileTest is Test {
    BlancProfile profile;
    address user1 = address(1);
    address user2 = address(2);
    
    function setUp() public {
        profile = new BlancProfile();
    }
    
    function testCreateProfile() public {
        vm.prank(user1);
        profile.createProfile("alice", "Hello world", "QmHash123");
        
        (string memory username, , , , ) = profile.getProfile(user1);
        assertEq(username, "alice");
    }
    
    function testCannotCreateDuplicateProfile() public {
        vm.prank(user1);
        profile.createProfile("alice", "Bio", "Hash");
        
        vm.prank(user1);
        vm.expectRevert("Profile already exists");
        profile.createProfile("alice2", "Bio2", "Hash2");
    }
    
    function testCannotUseTakenUsername() public {
        vm.prank(user1);
        profile.createProfile("alice", "Bio", "Hash");
        
        vm.prank(user2);
        vm.expectRevert("Username taken");
        profile.createProfile("alice", "Bio2", "Hash2");
    }
    
    function testFollow() public {
        vm.prank(user1);
        profile.createProfile("alice", "Bio", "Hash");
        
        vm.prank(user2);
        profile.createProfile("bob", "Bio", "Hash");
        
        vm.prank(user1);
        profile.follow(user2);
        
        assertTrue(profile.following(user1, user2));
        assertEq(profile.followerCount(user2), 1);
        assertEq(profile.followingCount(user1), 1);
    }
    
    function testUnfollow() public {
        vm.prank(user1);
        profile.createProfile("alice", "Bio", "Hash");
        
        vm.prank(user2);
        profile.createProfile("bob", "Bio", "Hash");
        
        vm.prank(user1);
        profile.follow(user2);
        
        vm.prank(user1);
        profile.unfollow(user2);
        
        assertFalse(profile.following(user1, user2));
        assertEq(profile.followerCount(user2), 0);
    }
    
    function testUpdateProfile() public {
        vm.prank(user1);
        profile.createProfile("alice", "Old bio", "OldHash");
        
        vm.prank(user1);
        profile.updateProfile("New bio", "NewHash");
        
        (, string memory bio, string memory picHash, , ) = profile.getProfile(user1);
        assertEq(bio, "New bio");
        assertEq(picHash, "NewHash");
    }
}

