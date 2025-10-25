// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "forge-std/Test.sol";
import "../contracts/BlancToken.sol";

contract BlancTokenTest is Test {
    BlancToken token;
    address owner = address(1);
    address minter = address(2);
    address user = address(3);
    
    function setUp() public {
        vm.prank(owner);
        token = new BlancToken();
    }
    
    function testInitialSupply() public view {
        assertEq(token.totalSupply(), 1_000_000 * 10**18);
        assertEq(token.balanceOf(owner), 1_000_000 * 10**18);
    }
    
    function testAddMinter() public {
        vm.prank(owner);
        token.addMinter(minter);
        assertTrue(token.minters(minter));
    }
    
    function testMintReward() public {
        vm.prank(owner);
        token.addMinter(minter);
        
        vm.prank(minter);
        token.mintReward(user, 100 * 10**18, "test_reward");
        
        assertEq(token.balanceOf(user), 100 * 10**18);
    }
    
    function testCannotMintWithoutPermission() public {
        vm.prank(user);
        vm.expectRevert("Not authorized to mint");
        token.mintReward(user, 100 * 10**18, "test");
    }
    
    function testBurn() public {
        vm.prank(owner);
        token.burn(1000 * 10**18);
        
        assertEq(token.balanceOf(owner), 999_000 * 10**18);
    }
}

