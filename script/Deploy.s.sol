//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/ArtistToken.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        new ArtistToken(
            "Test Token",
            "TEST",
            1_000_000 ether,
            msg.sender
        );

        vm.stopBroadcast();
    }
}