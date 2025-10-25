// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./DeployHelpers.s.sol";
import { BlancToken } from "../contracts/BlancToken.sol";
import { BlancProfile } from "../contracts/BlancProfile.sol";
import { BlancPosts } from "../contracts/BlancPosts.sol";
import { BlancPayments } from "../contracts/BlancPayments.sol";
import { BlancGovernance } from "../contracts/BlancGovernance.sol";

contract DeployBlanc is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        BlancToken token = new BlancToken();
        console.logString(string.concat("BlancToken deployed at: ", vm.toString(address(token))));
        
        BlancProfile profile = new BlancProfile();
        console.logString(string.concat("BlancProfile deployed at: ", vm.toString(address(profile))));
        
        BlancPosts posts = new BlancPosts(address(token), address(profile));
        console.logString(string.concat("BlancPosts deployed at: ", vm.toString(address(posts))));
        
        BlancPayments payments = new BlancPayments();
        console.logString(string.concat("BlancPayments deployed at: ", vm.toString(address(payments))));
        
        BlancGovernance governance = new BlancGovernance(address(token));
        console.logString(string.concat("BlancGovernance deployed at: ", vm.toString(address(governance))));
        
        token.addMinter(address(posts));
        console.logString("Posts contract added as minter");
        
        deployments.push(Deployment({name: "BlancToken", addr: address(token)}));
        deployments.push(Deployment({name: "BlancProfile", addr: address(profile)}));
        deployments.push(Deployment({name: "BlancPosts", addr: address(posts)}));
        deployments.push(Deployment({name: "BlancPayments", addr: address(payments)}));
        deployments.push(Deployment({name: "BlancGovernance", addr: address(governance)}));
    }
    
    function test() public {}
}

