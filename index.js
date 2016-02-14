var request = require("request");
var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  
  homebridge.registerAccessory("garageporten", "homebridge-GarageRemote", GarageRemoteAccessory);
}

function GarageRemoteAccessory(log, config) {
  this.log = log;
  // url info
  this.toggle_url = config["toggle_open_close_url"];
  this.currentState_url = config["lock_state_url"];
  this.auth_string = config["authstring"];
  
  // device info
  this.name = config["name"];
  
  this.service = new Service.GarageDoorOpener(this.name)
  
  this.service
  	.getCharacteristic(Characteristic.CurrentDoorState)
  	.on('get', this.getDoorState.bind(this)); // binds to prototype method getDoorState below.
  	
  this.service
  	.getCharacteristic(Characteristic.TargetDoorState)
    .on('get', function() { return Characteristic.CurrentDoorState.CLOSED;})
    .on('set', this.setDoorState.bind(this)); // binds to prototype method setDoorState below

  this.service
      .getCharacteristic(Characteristic.ObstructionDetected)
    .on('get', function() { return false;} );		// stub out since this info is not available.
}


GarageRemoteAccessory.prototype.getDoorState = function(callback) {
  this.log("Getting current door state...");
  
  request.get({
    url: this.currentState_url,
    headers: { 'Authorization' : this.auth_string }
  }, function(err, response, body) {
    
    if (!err && response.statusCode == 200) {
    	var locked = body == "1";
		this.log("Lock state is %s", locked);
    	if (locked) {
        	callback( null, Characteristic.CurrentDoorState.CLOSED );
    	}else{
        	callback( null, Characteristic.CurrentDoorState.OPEN );
    	}
    }
    else {
      this.log("Error getting state (status code %s): %s", response.statusCode, err);
      callback(err);
    }
  }.bind(this));
}

GarageRemoteAccessory.prototype.setDoorState = function(state, callback) {
  this.log("Toggle open/stop/close requesting state:", state);

  request.post({
    url: this.toggle_url,
    headers: { 'Authorization' : this.auth_string }
  }, function(err, response, body) {
    
    if (!err && response.statusCode == 200) {
      this.log("Toggle was successful");  // success
      callback(null);
    }
    else {
      this.log("Failed to toggle (status code %s): %s", response.statusCode, err);
      callback(err);
    }
  }.bind(this));
}

GarageRemoteAccessory.prototype.getServices = function() {
  return [this.service];
}
