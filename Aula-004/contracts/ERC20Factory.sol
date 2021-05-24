// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DummyERC20 is ERC20 {
    constructor (
        string memory name,
        string memory symbol,
        address owner
    ) ERC20(name, symbol) {
        _mint(owner, 2**254);
    }
}

contract ERC20Factory {
    function createERC20(string memory name, string memory symbol, address owner) public returns (address) {
        return address(new DummyERC20(name, symbol, owner));
    }
}