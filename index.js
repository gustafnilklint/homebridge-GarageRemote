var request = require("request");
var types;

module.exports = function(homebridge) {
  types = homebridge.hapLegacyTypes;

  homebridge.registerAccessory("homebridge-GarageRemote", "GarageRemote", GarageRemoteAccessory);
}

function GarageRemoteAccessory(log, config) {
  this.log = log;
  // url info
  this.toggle_url = config["toggle_open_close_url"];
  this.currentState_url = config["lock_state_url"];
  this.auth_string = config["authstring"];
  
  // device info
  this.name = config["name"];
}

GarageRemoteAccessory.prototype = {

  httpRequest: function(url, method, callback) {
    var options = {
    	url: url,
    	method: method,
    	headers: { 'Authorization' : this.auth_string }
        };
    request(options, function(error,response,body){
      callback(error, response, body)
    })
  },


	togglePortState: function(){
		url = this.toggle_url;
		//this.log("Toggle port state, url:" + url + "With outh: " + this.auth);
		
		this.httpRequest(url, "POST", function(error, response, body){
      		if (error) {
        		return console.error('toggle portState failed:', error);
      		}else{
        		return console.log('togglePort succeded!');
      		}
    	});
	},
	
	getLockState: function(callback){
		url = this.currentState_url;
		this.log("getting lock state for garage");
		
		this.httpRequest(url, "GET", function(error, response, body){
      		if (error) {
        		return console.error('get current state failed:', error);
      		}else{
        		var locked = body == "1"
        		callback(locked);
      		}
    	});
	},

  getServices: function() {
    var that = this;
    return [{
      sType: types.ACCESSORY_INFORMATION_STYPE,
      characteristics: [{
        cType: types.NAME_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: this.name,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Name of the accessory",
        designedMaxLength: 255
      },{
        cType: types.MANUFACTURER_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: "GarageRemote",
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Manufacturer",
        designedMaxLength: 255
      },{
        cType: types.MODEL_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: "Rev-1",
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Model",
        designedMaxLength: 255
      },{
        cType: types.SERIAL_NUMBER_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: "A1S2NASF88EW",
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "SN",
        designedMaxLength: 255
      },{
        cType: types.IDENTIFY_CTYPE,
        onUpdate: null,
        perms: ["pw"],
        format: "bool",
        initialValue: false,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Identify Accessory",
        designedMaxLength: 1
      }]
    },{
      sType: types.GARAGE_DOOR_OPENER_STYPE,
      characteristics: [{
        cType: types.NAME_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: "Garage Door",
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Name of service",
        designedMaxLength: 255
      },{
        cType: types.CURRENT_DOOR_STATE_CTYPE,
        onUpdate: function(value) { that.getLockState(null); },
        onRead: function(callback) { that.getLockState(callback); },
        perms: ["pr","ev"],
        format: "int",
        initialValue: 0,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "BlaBla",
        designedMinValue: 0,
        designedMaxValue: 4,
        designedMinStep: 1,
        designedMaxLength: 1
      },{
        cType: types.TARGET_DOORSTATE_CTYPE,
        onUpdate: function(value) { that.togglePortState(value); },
        perms: ["pr","pw","ev"],
        format: "int",
        initialValue: 1,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "BlaBla",
        designedMinValue: 0,
        designedMaxValue: 1,
        designedMinStep: 1,
        designedMaxLength: 1
      },{
        cType: types.OBSTRUCTION_DETECTED_CTYPE,
        onUpdate: function(value) { that.log("Obstruction detected: " + value); },
        perms: ["pr","ev"],
        format: "bool",
        initialValue: false,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "BlaBla"
      }]
    }];
  }
};
