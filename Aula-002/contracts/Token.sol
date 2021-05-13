// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MeuToken {
    string public symbol;
    string public name;

    address public owner;

    uint256 public totalSupply;

    mapping(address => uint256) _balances;

    mapping(address => mapping(address => uint256)) _allowances;

    constructor(string memory _symbol, string memory _name) {
        symbol = _symbol;
        name = _name;
        owner = msg.sender;
    }

    function balanceOf(address addr) public view returns (uint256 balance) {
        balance = _balances[addr];
    }

    // function totalSupply() public view returns (uint256) {
    //     return _totalSupply;
    // }

    function mint(address addr, uint256 value) public {
        require(msg.sender == owner, "MeuToken: Mensagem de erro");
        require(addr != address(0), "MeuToken: Can not mint to address zero");
        _balances[addr] = _balances[addr] + value;
        totalSupply = totalSupply + value;
    }

    function transfer(address recipient, uint256 amount) public {
        require(recipient != address(0), "MeuToken: Can not transfer to address zero");
        require(_balances[msg.sender] >= amount, "MeuToken: Not enought balance");
        require(_allowances[msg.sender][recipient] >= amount, "MeuToken: Not allowed to transfer this amount");
        _balances[msg.sender] = _balances[msg.sender] - amount;
        _balances[recipient] = _balances[recipient] + amount;

        _allowances[msg.sender][recipient] = _allowances[msg.sender][recipient] - amount;
    }

    function allowances(address addOwner, address sender) public view returns (uint256 allowance) {
        return _allowances[addOwner][sender];
    }

    function approve(address sender, uint256 amount) public {
        _allowances[msg.sender][sender] = _allowances[msg.sender][sender] + amount;
    }

}