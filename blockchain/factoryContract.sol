// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import './SolyContract.sol';

contract Factory is Ownable {
    string public _factoryName;
    string public _factoryTag;

    SolyContract[] public solyContracts;

    event SolyContractDeployed(address indexed by, address indexed contractAddress);

    constructor(string memory factoryName, string memory factoryTag) {
        _factoryName = factoryName;
        _factoryTag = factoryTag;
    }

    function createTicket(
        uint256 totalTickets,
        uint256 mintPrice,
        string memory name,
        string memory tag
    ) public onlyOwner returns (address) {
        SolyContract solyTicket = new SolyContract(totalTickets, mintPrice, name, tag);
        solyTicket.transferOwnership(msg.sender);
        solyContracts.push(solyTicket);
        emit SolyContractDeployed(msg.sender, address(solyTicket));
        return address(solyTicket);
    }

    function totalSolyContracts() public view returns (uint256) {
        return solyContracts.length;
    }
}
