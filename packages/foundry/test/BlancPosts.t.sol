// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "forge-std/Test.sol";
import "../contracts/BlancPosts.sol";
import "../contracts/BlancToken.sol";
import "../contracts/BlancProfile.sol";

contract BlancPostsTest is Test {
    BlancPosts posts;
    BlancToken token;
    BlancProfile profile;
    
    address creator = address(1);
    address participant1 = address(2);
    address participant2 = address(3);
    address liker = address(4);
    
    function setUp() public {
        token = new BlancToken();
        profile = new BlancProfile();
        posts = new BlancPosts(address(token), address(profile));
        
        token.addMinter(address(posts));
        
        vm.prank(creator);
        profile.createProfile("creator", "Bio", "Hash");
    }
    
    function testCreateSoloPost() public {
        address[] memory participants = new address[](0);
        
        vm.prank(creator);
        uint256 postId = posts.createPost(
            participants,
            "QmHash123",
            "My first post",
            true
        );
        
        assertEq(postId, 1);
        
        (
            ,
            address postCreator,
            ,
            string memory ipfsHash,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            bool isActive
        ) = posts.getPost(postId);
        
        assertEq(postCreator, creator);
        assertEq(ipfsHash, "QmHash123");
        assertTrue(isActive);
    }
    
    function testCreateCollabPost() public {
        address[] memory participants = new address[](2);
        participants[0] = participant1;
        participants[1] = participant2;
        
        vm.prank(creator);
        uint256 postId = posts.createPost(
            participants,
            "QmHash123",
            "Collab post",
            true
        );
        
        (
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            bool isActive
        ) = posts.getPost(postId);
        
        assertFalse(isActive);
    }
    
    function testVerifyPost() public {
        address[] memory participants = new address[](2);
        participants[0] = participant1;
        participants[1] = participant2;
        
        vm.prank(creator);
        uint256 postId = posts.createPost(
            participants,
            "QmHash123",
            "Collab",
            true
        );
        
        vm.prank(participant1);
        posts.verifyPost(postId);
        
        (uint256 verified, uint256 required, ) = posts.getVerificationStatus(postId);
        assertEq(verified, 1);
        assertEq(required, 2);
    }
    
    function testFullyVerifyPost() public {
        address[] memory participants = new address[](2);
        participants[0] = participant1;
        participants[1] = participant2;
        
        vm.prank(creator);
        uint256 postId = posts.createPost(
            participants,
            "QmHash123",
            "Collab",
            true
        );
        
        vm.prank(participant1);
        posts.verifyPost(postId);
        
        vm.prank(participant2);
        posts.verifyPost(postId);
        
        (
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            bool isActive
        ) = posts.getPost(postId);
        
        assertTrue(isActive);
    }
    
    function testLikePost() public {
        address[] memory participants = new address[](0);
        
        vm.prank(creator);
        uint256 postId = posts.createPost(
            participants,
            "QmHash123",
            "Post",
            true
        );
        
        vm.prank(liker);
        posts.likePost(postId);
        
        assertTrue(posts.hasUserLiked(postId, liker));
        
        (
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            uint256 likes,
            ,
            ,
        ) = posts.getPost(postId);
        
        assertEq(likes, 1);
    }
    
    function testCannotLikeTwice() public {
        address[] memory participants = new address[](0);
        
        vm.prank(creator);
        uint256 postId = posts.createPost(
            participants,
            "QmHash123",
            "Post",
            true
        );
        
        vm.prank(liker);
        posts.likePost(postId);
        
        vm.prank(liker);
        vm.expectRevert("Already liked");
        posts.likePost(postId);
    }
}

