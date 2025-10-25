// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BlancToken is ERC20, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10**18;
    uint256 public constant REWARD_PER_POST = 10 * 10**18;
    uint256 public constant REWARD_PER_VERIFICATION = 5 * 10**18;
    
    mapping(address => bool) public minters;
    
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event RewardMinted(address indexed recipient, uint256 amount, string reason);
    
    constructor() ERC20("Blanc Token", "BLANC") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }
    
    function addMinter(address minter) external onlyOwner {
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    function mintReward(address recipient, uint256 amount, string memory reason) external onlyMinter {
        _mint(recipient, amount);
        emit RewardMinted(recipient, amount, reason);
    }
    
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}

