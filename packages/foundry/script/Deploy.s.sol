//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import { DeployBlanc } from "./DeployBlanc.s.sol";

contract DeployScript is ScaffoldETHDeploy {
    function run() external {
        DeployBlanc deployBlanc = new DeployBlanc();
        deployBlanc.run();
    }
}
