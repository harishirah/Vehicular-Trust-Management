//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract RSU {
	address private admin;
	string adminName;

	constructor(string memory _name) {
		adminName = _name;
		admin = msg.sender;
	}

  function getAdmin() public view returns (string memory) {
    return adminName;
  }

	function setAdminName(string memory _adminName) public {
		adminName = _adminName;
	}
}
