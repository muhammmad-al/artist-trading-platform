// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/ArtistToken.sol";

contract ArtistTokenTest is Test {
    ArtistToken public token;
    address public owner;

    function setUp() public {
        owner = makeAddr("owner");
        vm.prank(owner);
        token = new ArtistToken("Test Token", "TEST", 1_000_000 ether, owner);
    }

    function testDeployment() public {
        assertEq(token.name(), "Test Token");
        assertEq(token.symbol(), "TEST");
        assertEq(token.totalSupply(), 1_000_000 ether);
        assertEq(token.owner(), owner);
    }
}
