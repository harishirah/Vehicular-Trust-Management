// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;

/** 
 * @title RSU
 * @dev Implements RSU  process along with vote delegation
 */
contract RSU {
    address admin;
    struct Vehicle {
        address addr;
        int trustValue;
        bool isRevoked;
    }
    struct ratingByVehicle {
        uint vehicleId;
        int rating;
    }
    struct Message {
        ratingByVehicle[] raters;
        int positiveRatings;
        int negativeRatings;
    }
    struct ratingRequest {
		uint vId;
  	    int rating;
    }
    uint numberOfMessages;
    mapping(string => uint) messageIds;
    mapping(address => bool) vehicleRegistered;
    mapping(address => uint) vIds;
    Vehicle[] vehicles;
    Message[] currentMessageRatings;
    
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Not Tranport Admin!!");
        _;
    }
    
    modifier isValidVehicle(address _addr) {
        require(vehicleRegistered[_addr] == true, "Vehicle not Registered!!!");
        require(vehicles[vIds[_addr]].isRevoked == false, "Vehicle is Revoked!!");
        _;
    }
    
    modifier isAdminOrVehicle(address _addr) {
        require(_addr == admin || (vehicleRegistered[_addr] = true && vehicles[vIds[_addr]].isRevoked == false), "You are neither a Admin nor a Vehicle");
        _;
    }
    
    modifier isValidMessage(string memory message) {
        require(messageIds[message] > 0, "Message not verified by concerned authority");
        require(messageIds[message] < numberOfMessages, "Message not verified by concerned authority");
        _;
    }
    
    constructor() {
        admin = msg.sender;
				/* vehicle[0] is dummy as any invalid message points to index = 0 */
				vehicles.push(Vehicle(msg.sender, 0, true));
        messageIds["traffic jam"] = 1;
        messageIds["accident"] = 2;
        messageIds["construction work"] = 3;
        messageIds["road damaged"] = 4;
        messageIds["safe"] = 5;
        messageIds["red light"] = 6;
        numberOfMessages = 7;
    }
    
    function getMessageId(string memory message) public view returns (uint) {
        return messageIds[message];
    }  
    
    function sendRating(ratingRequest[] memory inputRatings, string memory message) public isValidVehicle(msg.sender) isValidMessage(message) {
        int pos = 0; int neg = 0; 
        for(uint i = 0; i < inputRatings.length; i++) {
            // check if the message sender is a valid vehicle
			if(inputRatings[i].vId == 0 || inputRatings[i].vId > vehicles.length) {
				inputRatings[i].rating = 0;
				continue;
			}
			if(vehicles[inputRatings[i].vId].isRevoked) {
				inputRatings[i].rating = 0;
				continue;
			}
            if(inputRatings[i].rating == 1) pos++;
            else if (inputRatings[i].rating == -1) neg++;
        }

		for(uint i = 0; i < inputRatings.length; i++) {
			// calculate trust value offsets and update the trust value.
			if(inputRatings[i].rating == 0) continue;
			uint vId = inputRatings[i].vId;
			int trustValueOffset = (pos / (pos + neg)) * pos - (neg / (neg + pos)) * neg;
			trustValueOffset = trustValueOffset / (pos + neg);
			vehicles[vId].trustValue += trustValueOffset;
			if(vehicles[vId].trustValue <= 0) vehicles[vId].isRevoked = true;
		}
    } 
    
    function addVehicle(address _addr) public onlyAdmin {
        require(vehicleRegistered[_addr] == false, "Vehicle Already Registered!!");
        vehicleRegistered[_addr] = true;
        vehicles.push(Vehicle(_addr, 100, false));
        vIds[_addr] = vehicles.length - 1;
    }
    
    function getTrustValue(address _senderAddress) public view isValidVehicle(_senderAddress) returns (int) {
        require(vehicleRegistered[msg.sender] == true || msg.sender == admin, "Sender is not a valid Identity!!");
        return vehicles[vIds[_senderAddress]].trustValue;
    }

	function getVehicleId(address _addr) public view isValidVehicle(_addr) returns (uint) {
		return vIds[_addr];
	}
		
	function getVehicleInfo(address _senderAddress) public view isValidVehicle(_senderAddress) returns (address, int, bool) {				
		Vehicle memory tmp = vehicles[vIds[_senderAddress]];
		return (tmp.addr, tmp.trustValue, tmp.isRevoked);
	}
}