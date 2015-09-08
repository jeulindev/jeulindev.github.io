//https://www.mozilla.org/fr/plugincheck/
//chrome://plugins/


servo1_pwm_anglemin 	= servo2_pwm_anglemin 	= servo_pwm_anglemin 	=  14;
servo1_pwm_anglemax 	= servo2_pwm_anglemax 	= servo_pwm_anglemax 	= 108;
servo1_angle_pwmmin 	= servo2_angle_pwmmin 	= servo_angle_pwmmin 	= -60;
servo1_angle_pwmmax 	= servo2_angle_pwmmax 	= servo_angle_pwmmax 	=  60;
servo1_pwm_rotmin 		= servo2_pwm_rotmin 	= servo_pwm_rotmin 		=  60;
servo1_pwm_rotmax 		= servo2_pwm_rotmax 	= servo_pwm_rotmax 		=  78;
servo1_rot_pwmmin 		= servo2_rot_pwmmin 	= servo_rot_pwmmin 		= -10;
servo1_rot_pwmmax 		= servo2_rot_pwmmax 	= servo_rot_pwmmax 		=  10;


motor1_pwm_rotmin 		= motor2_pwm_rotmin 	= motor_pwm_rotmin 		=  24;
motor1_pwm_rotmax 		= motor2_pwm_rotmax 	= motor_pwm_rotmax 		=  29;
motor1_rot_pwmmin 		= motor2_rot_pwmmin 	= motor_rot_pwmmin 		= -10;
motor1_rot_pwmmax 		= motor2_rot_pwmmax 	= motor_rot_pwmmax 		=  10;

var myRooby;
var roobyInput = [0,0,0] ;
/*
function usbManager()
{

	this.empty = true;
	
	this.request = function(device, command, callback)
	{
		//console.log('request:'+this.empty);
		if (!this.empty)
		{
			window.setTimeout(function() {// rooby.request(device, command, callback);
			}, 100, device, command, callback);
		}
		var result = undefined;
		if (command.type == 'read')
		{
			result = device.read();
		} else if (command.type == 'write') {
			console.log("write :"+command.sel[0].toString(16)+", "+command.sel[1].toString(16)+", "+command.sel[2].toString(16)+", "+command.sel[3].toString(16)+", "+command.sel[4].toString(16)+", "+command.sel[5].toString(16)+", "+command.sel[6].toString(16)+", "+command.sel[7].toString(16)+".");
			device.write(command.sel);
		}
		
		this.empty = false;
		window.setTimeout(function() {
			myRooby.empty 	= true;
			//console.log('End Waiting');
		}, 100, this);
		
		callback(result);
	}
}*/



function unloadText() {
/*	oUSB.enabled = false;
	oUSB.timeout = 0;
	if (device) 
			device.close();*/
	//alert("unload event detected!");
  // remove the event to stop an infinite loop!
}
function usbManager(device)
{

	this.readStep 			= 0;
	this.defaultCommand 	= [0x00, 0x37, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
	this.currentCommand 	= [0x00, 0x37, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
	this.currentCallback 	= undefined;
	this.timeout			= 0; 		
	this.forcestop			= 0; 		
	this.request = function(device, command, callback)
	{
		if ((!device) || (!oUSB.enabled))
		{
			console.log('!! device not connected !!');
		} else {
			console.log('request: '+oUSB.currentCommand[0]+", "+
									oUSB.currentCommand[1]+", "+
									oUSB.currentCommand[2]+", "+
									oUSB.currentCommand[3]+", "+
									oUSB.currentCommand[4]+", "+
									oUSB.currentCommand[5]+", "+
									oUSB.currentCommand[6]+", "+
									oUSB.currentCommand[7]);

			var result = undefined;
			if (oUSB.readStep==0)
			{
				//-- readinit or write
				device.write(oUSB.currentCommand);
				//--
				if (oUSB.currentCallback)
				{
					oUSB.currentCallback();
					oUSB.currentCallback = undefined;
					for (i=0;i<9;i++)
					{
						oUSB.currentCommand[i] 	= oUSB.defaultCommand[i];
					}
					oUSB.readStep = 2;
				} else {
					oUSB.readStep = 1;
				}
				//--
				
			} else if (oUSB.readStep==1)
			{
				//--
				result 	 	= device.read();
				var s 		= new Uint8Array(result);
				roobyInput[0] = ((s[1]&0xff)<<8)|(s[2]&0xff);
				roobyInput[1] = ((s[3]&0xff)<<8)|(s[4]&0xff);
				roobyInput[2] = ((s[5]&0xff)<<8)|(s[6]&0xff);
				oUSB.readStep = 0;	
				if (oUSB.forcestop==1)
				{
					oUSB.forcestop = 2;		
				}				
				//console.log('Read done:'+s.length);
			} else if (oUSB.readStep==2)
			{
				//--force readinit after a write
				device.write(oUSB.currentCommand);
				oUSB.readStep = 1;
			}
		
			if (oUSB.forcestop!=2)
			{
				oUSB.timeout = window.setTimeout(function() { oUSB.request(device, command, callback);
				}, 100, device, command, callback);
			}
		}
		
	};
	
	this.write  = function(device, command, callback)
	{
		for (i=0;i<9;i++)
		{
			this.currentCommand[i] 	= command.sel[i];
			this.currentCallback 	= callback;
		}
	};


	
	this.init  = function(device, command, callback)
	{
		this.enabled 	= true;
		this.forcestop 	= 0;
		this.request(device);
		/*$(window).bind('beforeunload', function(event) {
			alert( 'pls save ur work');
		});*/
		//window.onblur = blurText;
		//window.onunload = unloadText;


	};
	this.stop  = function(device, command, callback)
	{	
		this.forcestop = 1;
	};
	oUSB 					= this;
	
}
var myRooby;
new (function() {
	var device 	= null;
	var input 	= null;
	var inputs 	= null;
	var poller 	= null;
	var ext 	= this;




	ext.testinit = function (callback) {
		myRooby.init(device);
		callback();
		return true;
	}
	
	ext.teststop = function (callback) {
		myRooby.stop(device);
		callback();
		return true;
	}	
	//-- 
	//-- Connected
	//--
	ext._deviceConnected = function(dev) {
		if (device) return;
		console.log('_deviceConnected');
		/*device1 	= dev;
		device1.open();
		device1.close();*/
		
		device 	= dev;
		device.open();
		
		myRooby = new usbManager(device);

	};
	
	//-- 
	//-- Removed
	//--
	ext._deviceRemoved = function(dev) {
		console.log('_deviceRemoved');
		myRooby.enabled = false;
		myRooby.timeout = 0;
		if(device != dev) 
			return;
		device = null;
	};
	
	//-- 
	//-- _shutdown
	//--
	ext._shutdown = function() {
		console.log('_shutdown');
		myRooby.enabled = false;
		myRooby.timeout = 0;
		console.log(myRooby.readStep);
		if (myRooby.readStep==1)
		{
			//--
			result 	 			= device.read();
			for(var i=0;i<1000;i++)
			{
				var s 		= new Uint8Array(result);
				roobyInput[0] = ((s[1]&0xff)<<8)|(s[2]&0xff);
				roobyInput[1] = ((s[3]&0xff)<<8)|(s[4]&0xff);
				roobyInput[2] = ((s[5]&0xff)<<8)|(s[6]&0xff);
				console.log("!!!"+myRooby.readStep);
			}
			myRooby.readStep 	= 0;
		}
		if (device) 
		{
			//device.clear();
			device.close();
		}

		device = null;
	}
	
	//-- 
	//-- status
	//--
	ext._getStatus = function() {
		if (!device) 
			return {status: 1, msg: 'Rooby disconnected'};
		return {status: 2, msg: 'Rooby connected'};
	}
	

	ext.fake = function (param1, callback) {
		console.log(inputs.length);
		return true;
	}

	ext.initInputs = function (callback) {
		myRooby.request(device, {
			type : 'write',
			sel	: [0x00, 0x37, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
		}, callback);
		return true;
	}

	
	ext.readDigitalInputs = function (param1, callback) {
		//var outputI = [0x00, 0x37, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
		//device.write(outputI);
		/*
		myRooby.request(device, {
			type : 'write',
			sel	: [0x00, 0x37, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
		}, function(){});

		if (!myRooby.empty)
		{
			window.setTimeout(function() { 
			
				myRooby.request(device, {
					type : 'read'
				}, function(inputs){
					var s = new Uint8Array(inputs);
					console.log('Read done:'+s.length);
					//console.log("read:"+s[0]+", "+s[1]+", "+s[2]+", "+s[3]+", "+s[4]+", "+s[5]+", "+s[6]+", "+s[7]);
					inputs = null;
					roobyInput[0] = ((s[1]&0xff)<<8)|(s[2]&0xff);
					roobyInput[1] = ((s[3]&0xff)<<8)|(s[4]&0xff);
					roobyInput[2] = ((s[5]&0xff)<<8)|(s[6]&0xff);	
				});
			
			}, 100, device, callback);
		}
		*/
		
		
		

		if (param1==0)
		{
			return (roobyInput[0]>0x1ff)? 0 : 1;	
		} else if (param1==1)
		{
			return (roobyInput[1]>0x1ff)? 0 : 1;
		} else if (param1==2)
		{
			return (roobyInput[2]>0x1ff)? 0 : 1;
		} else {
			return -1;	
		}		
		/*
		inputs = device.read();
		var s = new Uint8Array(inputs);
		//console.log("read:"+s[0]+", "+s[1]+", "+s[2]+", "+s[3]+", "+s[4]+", "+s[5]+", "+s[6]+", "+s[7]);
		inputs = null;
		input0 = ((s[1]&0xff)<<8)|(s[2]&0xff);
		input1 = ((s[3]&0xff)<<8)|(s[4]&0xff);
		input2 = ((s[5]&0xff)<<8)|(s[6]&0xff);	

		if (param1==0)
		{
			return (input0>0x1ff)? 0 : 1;	
		} else if (param1==1)
		{
			return (input1>0x1ff)? 0 : 1;
		} else if (param1==2)
		{
			return (input2>0x1ff)? 0 : 1;
		} else {
			return -1;	
		}
		*/
		
	}	
	
	ext.readAnalogInputs = function (param1, callback) {
		//device.write(output);
		/*
		var outputI = [0x00, 0x37, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
		device.write(outputI);
		
		inputs = device.read();
		var s = new Uint8Array(inputs);
		//console.log("read:"+s[0]+", "+s[1]+", "+s[2]+", "+s[3]+", "+s[4]+", "+s[5]+", "+s[6]+", "+s[7]);
		inputs = null;
		input0 = ((s[1]&0xff)<<8)|(s[2]&0xff);
		input1 = ((s[3]&0xff)<<8)|(s[4]&0xff);
		input2 = ((s[5]&0xff)<<8)|(s[6]&0xff);	
		console.log(param2);

		if (param1==0)
		{
			return input0;	
		} else if (param1==1)
		{
			return input1;	
		} else if (param1==2)
		{
			return input2;	
		} else {
			return -1;	
		}	
		*/
		if (param1==0)
		{
			return (roobyInput[0]>0x1ff)? 0 : 1;	
		} else if (param1==1)
		{
			return (roobyInput[1]>0x1ff)? 0 : 1;
		} else if (param1==2)
		{
			return (roobyInput[2]>0x1ff)? 0 : 1;
		} else {
			return -1;	
		}
	}	

	//m_servo1cycle 	= (((value-cst[ADDR_AMPMIN_SERVO1])*(cst[ADDR_PWMMAX_SERVO1]-cst[ADDR_PWMMIN_SERVO1])/(cst[ADDR_AMPMAX_SERVO1]-cst[ADDR_AMPMIN_SERVO1]))+cst[ADDR_PWMMIN_SERVO1]); 
	//-- ---------------------------------------
	//-- 	Servo  1
	//-- ---------------------------------------
	ext.setConfigMinServo1 = function (param1, param2, param3, callback) {
		if (param1=='ANGLE')
		{
			servo1_angle_pwmmin = param2;
			servo1_pwm_anglemin = param3;
		} else {
			servo1_rot_pwmmin 	= param2;
			servo1_pwm_rotmin 	= param3;
		}
		callback();
		return true;	
	}
	
	ext.setConfigMaxServo1 = function (param1, param2,  param3, callback) {
		if (param1=='ANGLE')
		{
			servo1_angle_pwmmax = param2;
			servo1_pwm_anglemax = param3;
		} else {
			servo1_rot_pwmmax 	= param3;
			servo1_pwm_rotmax 	= param2;
		}
		callback();
		return true;	
	}
	
	ext.setServo1 = function(param1, param2, callback) {
		if (!device) 
		{
			console.log('!! device not connected !!');
			callback();
		} else {
			if (param2 == 'ANGLE')
			{
				pwm 	= (((param1 - servo1_angle_pwmmin) * (servo1_pwm_anglemax - servo1_pwm_anglemin) / (servo1_angle_pwmmax - servo1_angle_pwmmin)) + servo1_pwm_anglemin); 
			} else if (param2 == 'VITESSE')
			{
				pwm 	= (((param1 - servo1_rot_pwmmin) * (servo1_pwm_rotmax - servo1_pwm_rotmin) / (servo1_rot_pwmmax - servo1_rot_pwmmin)) + servo1_pwm_rotmin); 
			} else {
				pwm = param1;
			}
			console.log('setServo1 to ' + parseInt(pwm));
			//var output2 = [0x00, 0x65, 0x83, parseInt(pwm), 0, 0x00, 0x00, 0x00, 0x00];
			//device.write(output2);
			myRooby.write(device, {
				type : 'write',
				sel	: [0x00, 0x65, 0x83, parseInt(pwm), 0, 0x00, 0x00, 0x00, 0x00]
			}, callback);
		}
		return true;
	}

	
	//-- ---------------------------------------
	//-- 	Servo  2
	//-- ---------------------------------------
	ext.setConfigMinServo2 = function (param1, param2, param3, callback) {
		if (param1=='ANGLE')
		{
			servo2_angle_pwmmin = param2;
			servo2_pwm_anglemin = param3;
		} else {
			servo2_rot_pwmmin 	= param2;
			servo2_pwm_rotmin 	= param3;
		}
		callback();
		return true;	
	}
	
	ext.setConfigMaxServo2 = function (param1, param2, param3, callback) {
		if (param1=='ANGLE')
		{
			servo2_angle_pwmmax = param2;
			servo2_pwm_anglemax = param3;
		} else {
			servo2_rot_pwmmax 	= param2;
			servo2_pwm_rotmax 	= param3;
		}
		callback();
		return true;	
	}

	ext.setServo2 = function(param1, param2, callback) {
		if (!device) 
		{
			console.log('!! device not connected !!');
			callback();
		} else {
			if (param2 == 'ANGLE')
			{
				pwm 	= (((param1 - servo2_angle_pwmmin) * (servo2_pwm_anglemax - servo2_pwm_anglemin) / (servo2_angle_pwmmax - servo2_angle_pwmmin)) + servo2_pwm_anglemin); 
			} else if (param2 == 'VITESSE')
			{
				pwm 	= (((param1 - servo2_rot_pwmmin) * (servo2_pwm_rotmax - servo2_pwm_rotmin) / (servo2_rot_pwmmax - servo2_rot_pwmmin)) + servo2_pwm_rotmin); 
			} else {
				pwm = param1;
			}
			//console.log('setServo2 to '+pwm);
			//var output2 = [0x00, 0x65, 0x84, parseInt(pwm), 0, 0x00, 0x00, 0x00, 0x00];
			//device.write(output2);
			myRooby.write(device, {
				type : 'write',
				sel	: [0x00, 0x65, 0x84, parseInt(pwm), 0, 0x00, 0x00, 0x00, 0x00]
			}, callback);
		}
		return true;
	}


	//-- ---------------------------------------
	//-- 	Motor 1
	//-- ---------------------------------------
	ext.setConfigMinMotor1 = function (param1, param2, param3, callback) {
		motor1_rot_pwmmin 	= param2;
		motor1_pwm_rotmin 	= param3;
		callback();
		return true;	
	}
	
	ext.setConfigMaxMotor1 = function (param1, param2, param3, callback) {
		motor1_rot_pwmmax 	= param2;
		motor1_pwm_rotmax 	= param3;
		callback();
		return true;	
	}

	ext.setMotor1 = function(param1, param2, callback) {
		if (!device) 
		{
			console.log('!! device not connected !!');
			callback();
		} else {
			if (param2 == 'VITESSE')
			{
				pwm 	= (((param1 - motor1_rot_pwmmin) * (motor1_pwm_rotmax - motor1_pwm_rotmin) / (motor1_rot_pwmmax - motor1_rot_pwmmin)) + motor1_pwm_rotmin); 
			} else {
				pwm = param1;
			}
			//console.log('setMotor1 to '+pwm);
			//var output2 = [0x00, 0x65, 0x86, parseInt(pwm), 0, 0x01, 0x00, 0x00, 0x00];
			//device.write(output2);
			myRooby.write(device, {
				type : 'write',
				sel	: [0x00, 0x65, 0x86, parseInt(pwm), 0, 0x00, 0x00, 0x00, 0x00]
			}, callback);			
		}
		return true;
	}
	
	//-- ---------------------------------------
	//-- 	Motor 2
	//-- ---------------------------------------
	ext.setConfigMinMotor2 = function (param1, param2, param3, callback) {
		motor2_rot_pwmmin 	= param2;
		motor2_pwm_rotmin 	= param3;
		callback();
		return true;	
	}
	
	ext.setConfigMaxMotor2 = function (param1, param2, param3, callback) {
		motor2_rot_pwmmax 	= param2;
		motor2_pwm_rotmax 	= param3;
		callback();
		return true;	
	}

	ext.setMotor2 = function(param1, param2, callback) {
		if (!device) 
		{
			console.log('!! device not connected !!');
			callback();
		} else {
			if (param2 == 'VITESSE')
			{
				pwm 	= (((param1 - motor2_rot_pwmmin) * (motor2_pwm_rotmax - motor2_pwm_rotmin) / (motor2_rot_pwmmax - motor2_rot_pwmmin)) + motor2_pwm_rotmin); 
			} else {
				pwm = param1;
			}
			//var output2 = [0x00, 0x65, 0x85, parseInt(pwm), 0, 0x00, 0x00, 0x00, 0x00];
			//device.write(output2);
			myRooby.write(device, {
				type : 'write',
				sel	: [0x00, 0x65, 0x85, parseInt(pwm), 0, 0x00, 0x00, 0x00, 0x00]
			}, callback);
		}
		return true;
	}
	
	ext.setOutput3 = function(param1, callback) {
		if (!device) 
		{
			console.log('!! device not connected !!');
			callback();
		} else {
			//var output2 = [0x00, 0x65, 0x82, param1, 0, 0x00, 0x00, 0x00, 0x00];
			//device.write(output2);
			myRooby.write(device, {
				type : 'write',
				sel	: [0x00, 0x65, 0x82, param1, 0, 0x00, 0x00, 0x00, 0x00]
			}, callback);
		}
		return true;
	}
	
	var descriptor = {
		blocks: [
			['w', 'Servo1 %m.cfgMode1 min %d à %d (PWM) ',   	'setConfigMinServo1', 'ANGLE', servo_angle_pwmmin,  servo_pwm_anglemin], //http://www.fileformat.info/info/unicode/char/2220/index.htm ∠ 
			['w', 'Servo1 %m.cfgMode1 max %d à %d (PWM) ',   	'setConfigMaxServo1', 'ANGLE', servo_angle_pwmmax,  servo_pwm_anglemax],
			
			['w', 'Servo2 %m.cfgMode1 min %d à %d (PWM) ',   	'setConfigMinServo2', 'ANGLE', servo_angle_pwmmin,  servo_pwm_anglemin],
			['w', 'Servo2 %m.cfgMode1 max %d à %d (PWM) ',   	'setConfigMaxServo2', 'ANGLE', servo_angle_pwmmax,  servo_pwm_anglemax],

			['w', 'Moteur 1 vitesse min %d à %d (PWM) ',   		'setConfigMinMotor1', motor_rot_pwmmin,  motor_pwm_rotmin],
			['w', 'Moteur 1 vitesse max %d à %d (PWM) ',   		'setConfigMaxMotor1', motor_rot_pwmmax,  motor_pwm_rotmax],
			
			['w', 'Moteur 2 vitesse min %d à %d (PWM) ',   		'setConfigMinMotor2', motor_rot_pwmmin,  motor_pwm_rotmin],
			['w', 'Moteur 2 vitesse max %d à %d (PWM) ',   		'setConfigMaxMotor2', motor_rot_pwmmax,  motor_pwm_rotmax],
			
			['w', 'Set Servo1 à %d ( %m.pwmMode1 )', 			'setServo1', 0, 'ANGLE'],
			['w', 'Set Servo2 à %d ( %m.pwmMode1 )', 			'setServo2', 0, 'ANGLE'],
			['w', 'Set Moteur1 à %d ( %m.pwmMode2 )', 		 	'setMotor1', 0, 'VITESSE'],
			['w', 'Set Moteur2 à %d ( %m.pwmMode2 )', 		 	'setMotor2', 0, 'VITESSE'],

			
			['w', 'Affecter Sortie n°3 %d', 'setOutput3', 0],
			['w', 'INIT', 'testinit'],
			['w', 'STOP', 'teststop'],
			
			//['w', 'init inputs', 'initInputs'],
			['r', 'Lire entrée numérique  %d ', 'readDigitalInputs', 0],
			['r', 'Lire entrée analoqique %d ', 'readAnalogInputs', 0],
	],
	menus: {
		cfgMode1: ['ANGLE', 'VITESSE'],
		pwmMode1: ['PWM', 'ANGLE', 'VITESSE'],
		pwmMode2: ['PWM', 'VITESSE'],
		}
	};
	ScratchExtensions.register('Rooby', descriptor, ext, {type: 'hid', vendor:0x0fd7, product:0x5010}); //ICE_ID  "Vid_0fd7&Pid_5010"	
	//ScratchExtensions.register('Rooby', descriptor, ext, {type: 'hid', vendor:0x04d8, product:0x003F}); //
})();
//ScratchExtensions.unregister('Rooby');