// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;

/** 
 * @title RSU
 * @dev Implements RSU  process along with Trust Value Updation
 */
contract RSU {
    address admin;
    struct Vehicle {
        address addr;
        int trustValue;
        bool isRevoked;
    }

    struct ratingArray {
		address addr;
  	    int rating;
    }

    uint256 public sessionStart;
    mapping(string=> ratingArray[]) sessionStorage;
    string[] sessionEvents;
    Vehicle[] vehicles;
    uint public numberOfMessages;
    string[] public msgs;
    mapping(string => uint) messageIds;
    mapping(address => bool) vehicleRegistered;
    mapping(address => uint) vIds;
	
	/* Modifiers */
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
        sessionStart = 0; // Session Start Time at Contract Initialisation
		/* vehicle[0] is dummy as any invalid message points to index = 0 */
		vehicles.push(Vehicle(msg.sender, 0, true));
        messageIds["traffic jam"] = 1;
        msgs.push("traffic jam");
        messageIds["accident"] = 2;
        msgs.push("accident");
        messageIds["construction work"] = 3;
        msgs.push("construction work");
        messageIds["road damaged"] = 4;
        msgs.push("road damaged");
        messageIds["safe"] = 5;
        msgs.push("safe");
        messageIds["red light"] = 6;
        msgs.push("red light");
        numberOfMessages = 7;
    }
    
	/* Get Functions (No Gas Fees) */
    function getMessageId(string memory message) public view returns (uint) {
        return messageIds[message];
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

	/* Transactions (Require Gas Fees) */
    function sendRatings(ratingArray[] memory inputRatings, string memory eventHash,string memory message,uint256 timeStamp) public isValidVehicle(msg.sender) isValidMessage(message) {
        // Map(eventHash=>array[structs])
        if(sessionStart+180000<=timeStamp){
            sessionEnd();
            sessionStart=timeStamp;
        }
        if(sessionStorage[eventHash].length==0)sessionEvents.push(eventHash);
        for(uint i=0;i<inputRatings.length;i++){
            // check if the message sender is a valid vehicle
			if(vIds[inputRatings[i].addr] == 0 || vIds[inputRatings[i].addr] > vehicles.length) {
				inputRatings[i].rating = 0;
				continue;
			}
			if(vehicles[vIds[inputRatings[i].addr]].isRevoked) {
				inputRatings[i].rating = 0;
				continue;
			}
            bool pushed=false;
            for(uint j=0;j<sessionStorage[eventHash].length;j++){
                if(sessionStorage[eventHash][j].addr==inputRatings[i].addr){
                    pushed=true;
                    sessionStorage[eventHash][j].rating+=inputRatings[i].rating;
                    break;
                }
            }
            if(pushed==false){
                sessionStorage[eventHash].push(inputRatings[i]);
            }
        }
    } 
    
	// Registering a new Vehicle (only by Transport Administrator)
    function addVehicle(address _addr) public onlyAdmin {
        require(vehicleRegistered[_addr] == false, "Vehicle Already Registered!!");
        vehicleRegistered[_addr] = true;
        vehicles.push(Vehicle(_addr, 1000, false));
        vIds[_addr] = vehicles.length - 1;
    }
    
    function addMsg(string memory message) public onlyAdmin {
        require(messageIds[message]==0,"Message Already in DataBase");
        messageIds[message]=numberOfMessages;
        msgs.push(message);
        numberOfMessages+=1;
    }

    function sessionEnd() public{
        for(uint i=0;i<sessionEvents.length;i++){
            int pos=0;
            int neg=0;
            for(uint j=0;j<sessionStorage[sessionEvents[i]].length;j++){
                if(sessionStorage[sessionEvents[i]][j].rating<0){
                    neg-=sessionStorage[sessionEvents[i]][j].rating;
                }else{
                    pos+=sessionStorage[sessionEvents[i]][j].rating;
                }
            }
            int offset=(500*(pos*pos*pos-neg*neg*neg))/((pos*pos+neg*neg)*(pos+neg));
            for(uint j=0;j<sessionStorage[sessionEvents[i]].length;j++){
                if(sessionStorage[sessionEvents[i]][j].rating<=0){
                    vehicles[vIds[sessionStorage[sessionEvents[i]][j].addr]].trustValue-=offset;
                    // Check For revoke
                    if(vehicles[vIds[sessionStorage[sessionEvents[i]][j].addr]].trustValue <= 0) {
                        vehicles[vIds[sessionStorage[sessionEvents[i]][j].addr]].isRevoked = true;
                    }
                }else{
                    vehicles[vIds[sessionStorage[sessionEvents[i]][j].addr]].trustValue+=offset;
                    // Check For Inflation
                    if(vehicles[vIds[sessionStorage[sessionEvents[i]][j].addr]].trustValue > 1500) {
                        vehicles[vIds[sessionStorage[sessionEvents[i]][j].addr]].trustValue = 1500;
                    }
                }
            }
            delete sessionStorage[sessionEvents[i]];
        }
        delete sessionEvents;
    }
}