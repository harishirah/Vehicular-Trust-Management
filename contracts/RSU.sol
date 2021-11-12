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
        messageIds["event 1"] = 1;
        msgs.push("event 1");
        messageIds["event 2"] = 2;
        msgs.push("event 2");
        messageIds["event 3"] = 3;
        msgs.push("event 3");
        messageIds["event 4"] = 4;
        msgs.push("event 4");
        messageIds["event 5"] = 5;
        msgs.push("event 5");
        messageIds["event 6"] = 6;
        msgs.push("event 6");
        messageIds["event 7"] = 7;
        msgs.push("event 7");
        messageIds["event 8"] = 8;
        msgs.push("event 8");
        messageIds["event 9"] = 9;
        msgs.push("event 9");
        messageIds["event 10"] = 10;
        msgs.push("event 10");
        messageIds["event 11"] = 11;
        msgs.push("event 11");
        messageIds["event 12"] = 12;
        msgs.push("event 12");
        messageIds["event 13"] = 13;
        msgs.push("event 13");
        messageIds["event 14"] = 14;
        msgs.push("event 14");
        messageIds["event 15"] = 15;
        msgs.push("event 15");
        messageIds["event 16"] = 16;
        msgs.push("event 16");
        messageIds["event 17"] = 17;
        msgs.push("event 17");
        messageIds["event 18"] = 18;
        msgs.push("event 18");
        messageIds["event 19"] = 19;
        msgs.push("event 19");
        numberOfMessages = 20;
    }
    
	/* Get Functions (No Gas Fees) */
    function getMessageId(string memory message) public view returns (uint) {
        return messageIds[message];
    }  
    
    function getTrustValue(address _senderAddress) public view isValidVehicle(_senderAddress) returns (int) {
        // require(vehicleRegistered[msg.sender] == true || msg.sender == admin, "Sender is not a valid Identity!!");
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
        vehicles.push(Vehicle(_addr, 60, false));
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
            int offset=(16*(pos*pos*pos-neg*neg*neg))/((pos*pos+neg*neg)*(pos+neg));
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
                    if(vehicles[vIds[sessionStorage[sessionEvents[i]][j].addr]].trustValue > 100) {
                        vehicles[vIds[sessionStorage[sessionEvents[i]][j].addr]].trustValue = 100;
                    }
                }
            }
            delete sessionStorage[sessionEvents[i]];
        }
        delete sessionEvents;
    }
}