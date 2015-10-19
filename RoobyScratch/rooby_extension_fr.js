// http://scratchx.org/?url=http://jeulindev.github.io/RoobyScratch/RoobyStartProject.sbx
// http://scratchx.org/?url=http://jeulindev.github.io/RoobyScratch/rooby_extension_fr.js

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


motor1_dir_rot 			= motor2_dir_rot 		= motor_dir_rot 		=  1;
motor1_pwm_rotmin 		= motor2_pwm_rotmin 	= motor_pwm_rotmin 		=  24;
motor1_pwm_rotmax 		= motor2_pwm_rotmax 	= motor_pwm_rotmax 		=  49;
motor1_rot_pwmmin 		= motor2_rot_pwmmin 	= motor_rot_pwmmin 		=   0;
motor1_rot_pwmmax 		= motor2_rot_pwmmax 	= motor_rot_pwmmax 		=  10;

var myRooby;
var roobyInput = [0,0,0] ;



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


	this.readDevice = function(device)
	{
		if ((!device) || (!oUSB.enabled))
		{
			console.log('!! device not connected !!');
		} else {
			var result = undefined;
			//--
			result 	 	= device.read( function() {});
			var s 		= new Uint8Array(result);
			roobyInput[0] = ((s[1]&0xff)<<8)|(s[2]&0xff);
			roobyInput[1] = ((s[3]&0xff)<<8)|(s[4]&0xff);
			roobyInput[2] = ((s[5]&0xff)<<8)|(s[6]&0xff);
		} 
	}

	
	this.request = function(device, command)
	{
		if ((!device) || (!oUSB.enabled))
		{
			console.log('!! device not connected !!');
		} else {
			console.log(oUSB.readStep+': request: '+oUSB.currentCommand[0]+", "+
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
					try {oUSB.currentCallback(); } catch(err) {console.log(err.message); }
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
				//console.log("called");
				
			} else if (oUSB.readStep==1)
			{
				//--
				result 	 	= device.read( function(data) {
					var s =new Uint8Array(data);
					roobyInput[0] = ((s[1]&0xff)<<8)|(s[2]&0xff);
					roobyInput[1] = ((s[3]&0xff)<<8)|(s[4]&0xff);
					roobyInput[2] = ((s[5]&0xff)<<8)|(s[6]&0xff);	
					console.log(roobyInput);					
				});
				/*var s 		= new Uint8Array(result);
				roobyInput[0] = ((s[1]&0xff)<<8)|(s[2]&0xff);
				roobyInput[1] = ((s[3]&0xff)<<8)|(s[4]&0xff);
				roobyInput[2] = ((s[5]&0xff)<<8)|(s[6]&0xff);*/
				oUSB.readStep = 0;	
				if (oUSB.forcestop==1)
				{
					oUSB.forcestop = 2;		
				}				
				//console.log('Read done:');
			} else if (oUSB.readStep==2)
			{
				//--force readinit after a write
				device.write(oUSB.currentCommand);
				oUSB.readStep = 1;
				//console.log('Write');
			}
		
			if ( (oUSB.forcestop!=2))
			{
				oUSB.timeout = window.setTimeout(function() { oUSB.request(device, command);
				}, 100, device, command);
			}
		}
		
	};
	
	//-- Asynchronous
	this.writeASYNC  = function(device, command, callback)
	{
		for (i=0;i<9;i++)
		{
			this.currentCommand[i] 	= command.sel[i];
		}
		this.currentCallback 	= callback;
	};
	
	this.readASYNC  = this.writeASYNC;

	//- synchronous
	this.writeSYNC  = function(device, command, callback)
	{
		for (i=0;i<9;i++)
		{
			this.currentCommand[i] 	= command.sel[i];
		}
		this.currentCallback 	= callback;
		device.write(oUSB.currentCommand); callback();
	};
	
	this.readSYNC  = function(device, command, callback)
	{
		device.write(oUSB.defaultCommand); 
		oUSB.readDevice(device);
		
		//oUSB.timeout = window.setTimeout(function() { oUSB.readDevice(device); }, 100, device);
	};	
	
	
	//-- Bindings
	this.write = this.writeASYNC;
	this.read  = this.readASYNC;
	
	
	//-----------------------------------
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
		
		myRooby.write(device, { type : 'write', sel	: [0x00, 0x65, 0x81, 0, 0, 0x00, 0x00, 0x00, 0x00] }, function() {});
		myRooby.write(device, { type : 'write', sel	: [0x00, 0x65, 0x82, 0, 0, 0x00, 0x00, 0x00, 0x00] }, function() {});
		myRooby.write(device, { type : 'write', sel	: [0x00, 0x65, 0x83, 0, 0, 0x00, 0x00, 0x00, 0x00] }, function() {});
		myRooby.write(device, { type : 'write', sel	: [0x00, 0x65, 0x84, 0, 0, 0x00, 0x00, 0x00, 0x00] }, function() {});
		myRooby.write(device, { type : 'write', sel	: [0x00, 0x65, 0x85, 0, 0, 0x00, 0x00, 0x00, 0x00] }, function() {});
		myRooby.write(device, { type : 'write', sel	: [0x00, 0x65, 0x86, 0, 0, 0x00, 0x00, 0x00, 0x00] }, function() {});
		
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
		//myRooby.read(device);
		if (param1==0)
		{
			val = (roobyInput[0]>0x1ff)? 0 : 1;	
		} else if (param1==1)
		{
			val = (roobyInput[1]>0x1ff)? 0 : 1;
		} else if (param1==2)
		{
			val = (roobyInput[2]>0x1ff)? 0 : 1;
		} else {
			val = -1;	
		}	
		//callback();	
		return val;		

		
	}	
	
	ext.readAnalogInputs = function (param1, callback) {
		if (param1==0)
		{
			return roobyInput[0];	
		} else if (param1==1)
		{
			return roobyInput[1];
		} else if (param1==2)
		{
			return roobyInput[2];
		} else {
			return -1;	
		}
	}	

	//m_servo1cycle 	= (((value-cst[ADDR_AMPMIN_SERVO1])*(cst[ADDR_PWMMAX_SERVO1]-cst[ADDR_PWMMIN_SERVO1])/(cst[ADDR_AMPMAX_SERVO1]-cst[ADDR_AMPMIN_SERVO1]))+cst[ADDR_PWMMIN_SERVO1]); 
	//-- ---------------------------------------
	//-- 	Servo  1
	//-- ---------------------------------------
	ext.setConfigMinServo1 = function (paramPWM, paramType, paramCons, callback) {
		if (paramType=='ANGLE')
		{
			servo1_angle_pwmmin = paramCons;
			servo1_pwm_anglemin = paramPWM;
		} else {
			servo1_rot_pwmmin 	= paramCons;
			servo1_pwm_rotmin 	= paramPWM;
		}
		try {callback(); } catch(err) {console.log(err.message); }
		return true;	
	}
	
	ext.setConfigMaxServo1 = function (paramPWM, paramType, paramCons, callback) {
		if (paramType=='ANGLE')
		{
			servo1_angle_pwmmax = paramCons;
			servo1_pwm_anglemax = paramPWM;
		} else {
			servo1_rot_pwmmax 	= paramCons;
			servo1_pwm_rotmax 	= paramPWM;
		}
		try {callback(); } catch(err) {console.log(err.message); }
		return true;	
	}
	
	ext.setServo1 = function(param1, param2, callback) {
		if (!device) 
		{
			console.log('!! device not connected !!');
			try {callback(); } catch(err) {console.log(err.message); }
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
	ext.setConfigMinServo2 = function (paramPWM, paramType, paramCons, callback) {
		if (paramType=='ANGLE')
		{
			servo2_angle_pwmmin = paramCons;
			servo2_pwm_anglemin = paramPWM;
		} else {
			servo2_rot_pwmmin 	= paramCons;
			servo2_pwm_rotmin 	= paramPWM;
		}
		try {callback(); } catch(err) {console.log(err.message); }
		return true;	
	}
	
	ext.setConfigMaxServo2 = function (paramPWM, paramType, paramCons, callback) {
		if (paramType=='ANGLE')
		{
			servo2_angle_pwmmax = paramCons;
			servo2_pwm_anglemax = paramPWM;
		} else {
			servo2_rot_pwmmax 	= paramCons;
			servo2_pwm_rotmax 	= paramPWM;
		}
		try {callback(); } catch(err) {console.log(err.message); }
		return true;	
	}

	ext.setServo2 = function(param1, param2, callback) {
		if (!device) 
		{
			console.log('!! device not connected !!');
			try {callback(); } catch(err) {console.log(err.message); }
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
	ext.setConfigDirMotor1 = function (paramDir,  callback) {
		if (paramDir == 'Inverser')
		{
			motor1_dir_rot = -1;
		} else {
			motor1_dir_rot = 1;
		}
		try {callback(); } catch(err) {console.log(err.message); }
		return true;	
	}
	
	ext.setConfigMinMotor1 = function (paramPWM, paramCons,  callback) {
		motor1_rot_pwmmin 	= paramCons;
		motor1_pwm_rotmin 	= paramPWM;
		try {callback(); } catch(err) {console.log(err.message); }
		return true;	
	}
	
	ext.setConfigMaxMotor1 = function (paramPWM, paramCons,  callback) {
		motor1_rot_pwmmax 	= paramCons;
		motor1_pwm_rotmax 	= paramPWM;
		try {callback(); } catch(err) {console.log(err.message); }
		return true;	
	}

	ext.setMotor1 = function(param1, param2, callback) {
		if (!device) 
		{
			console.log('!! device not connected !!');
			try {callback(); } catch(err) {console.log(err.message); }
		} else {
			sign = 0;
			if (param1<0)
			{
				param1 = 0-param1;
				sign = 1;
			}
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
				//sel	: [0x00, 0x65, 0x86, parseInt(pwm), (motor1_dir_rot==-1)?0xff:0, (motor1_dir_rot==-1)?0:1, 0x00, 0x00, 0x00]
				//sel	: [0x00, 0x65, 0x86, parseInt(pwm*sign), (sign>0)? 0x00: 0xff, 0x00, 0x00, 0x00, 0x00]
				sel	: [0x00, 0x65, 0x86, parseInt(pwm), 0x00, sign^(motor1_dir_rot==-1), 0x00, 0x00, 0x00]
			}, callback);			
		}
		return true;
	}
	
	//-- ---------------------------------------
	//-- 	Motor 2
	//-- ---------------------------------------
	ext.setConfigDirMotor2 = function (paramDir,  callback) {
		if (paramDir == 'Inverser')
		{
			motor2_dir_rot = -1;
		} else {
			motor2_dir_rot = 1;
		}
		try {callback(); } catch(err) {console.log(err.message); }
		return true;	
	}

	ext.setConfigMinMotor2 = function (paramPWM, paramCons, callback) {
		motor2_rot_pwmmin 	= paramCons;
		motor2_pwm_rotmin 	= paramPWM;
		try {callback(); } catch(err) {console.log(err.message); }
		return true;	
	}
	
	ext.setConfigMaxMotor2 = function (paramPWM, paramCons, callback) {
		motor2_rot_pwmmax 	= paramCons;
		motor2_pwm_rotmax 	= paramPWM;
		try {callback(); } catch(err) {console.log(err.message); }
		return true;	
	}

	ext.setMotor2 = function(param1, param2, callback) {
		if (!device) 
		{
			console.log('!! device not connected !!');
		try {callback(); } catch(err) {console.log(err.message); }
		} else {
			sign = 0;
			if (param1<0)
			{
				param1 	= 0-param1;
				sign 	= 1;
			}
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
				//sel	: [0x00, 0x65, 0x85,  parseInt(pwm),(motor2_dir_rot==-1)?0xff:0, (motor2_dir_rot==-1)?0:1, 0x00, 0x00, 0x00]
				sel	: [0x00, 0x65, 0x85, parseInt(pwm), 0x00, sign^(motor2_dir_rot==-1), 0x00, 0x00, 0x00]
			}, callback);
		}
		return true;
	}
	
	ext.setOutput3 = function(param1, param2, callback) {
		if (!device) 
		{
			console.log('!! device not connected !!');
			try {callback(); } catch(err) {console.log(err.message); }
		} else {
			//var output2 = [0x00, 0x65, 0x82, param2, 0, 0x00, 0x00, 0x00, 0x00];
			//device.write(output2);
			if (param1=='LED')
			{
				myRooby.write(device, {
					type : 'write',
					sel	: [0x00, 0x65, 0x82, param2, 0, 0x00, 0x00, 0x00, 0x00]
				}, callback);
			} else {
				myRooby.write(device, {
					type : 'write',
					sel	: [0x00, 0x65, 0x81, param2, 0, 0x00, 0x00, 0x00, 0x00]
				}, callback);
			}
			
		}
		return true;
	}
	
	var descriptor = {
		blocks: [
			//-------------------------------
			['w', 'Affecter Servo1 à %d ( %m.pwmMode1 )', 			'setServo1', 0, 'ANGLE'],
			['w', 'Affecter Servo2 à %d ( %m.pwmMode1 )', 			'setServo2', 0, 'ANGLE'],
			['w', 'Affecter Moteur1 à %d ( %m.pwmMode2 )', 		 	'setMotor1', 0, 'VITESSE'],
			['w', 'Affecter Moteur2 à %d ( %m.pwmMode2 )', 		 	'setMotor2', 0, 'VITESSE'],
			['w', 'Affecter sortie %m.outputName à %d', 			'setOutput3', 'LED', 0],
			
			//-------------------------------
			['w', 'Configure Rooby', 'testinit'],
			['w', 'Arrêter Rooby',   'teststop'],
			
			//-------------------------------
			//['w', 'init inputs', 'initInputs'],
			['r', 'Lire entrée numérique  n°%m.inputNb ', 'readDigitalInputs', 0],
			['r', 'Lire entrée analoqique n°%m.inputNb ', 'readAnalogInputs',  0],

			//-------------------------------
			['w', 'Servo 1 : Définir PWM à %d pour %m.cfgMode1 min %d ',   'setConfigMinServo1',  servo_pwm_anglemin,  'ANGLE', servo_angle_pwmmin], 
			['w', 'Servo 1 : Définir PWM à %d pour %m.cfgMode1 max %d ',   'setConfigMaxServo1',  servo_pwm_anglemax,  'ANGLE', servo_angle_pwmmax], 
			
			['w', 'Servo 2 : Définir PWM à %d pour %m.cfgMode1 min %d ',   'setConfigMinServo2',  servo_pwm_anglemin,  'ANGLE', servo_angle_pwmmin], 
			['w', 'Servo 2 : Définir PWM à %d pour %m.cfgMode1 max %d ',   'setConfigMaxServo2',  servo_pwm_anglemax,  'ANGLE', servo_angle_pwmmax], 

			['w', 'Moteur 1 : %m.dirMode1 sens de rotation',   				'setConfigDirMotor1', 'Inverser'],
			['w', 'Moteur 1 : Définir PWM à %d pour vitesse min %d ',   	'setConfigMinMotor1', motor_pwm_rotmin, motor_rot_pwmmin],
			['w', 'Moteur 1 : Définir PWM à %d pour vitesse max %d ',   	'setConfigMaxMotor1', motor_pwm_rotmax, motor_rot_pwmmax],

			['w', 'Moteur 2 : %m.dirMode1 sens de rotation',   				'setConfigDirMotor2', 'Inverser' ],
			['w', 'Moteur 2 : Définir PWM à %d pour vitesse min %d ',   	'setConfigMinMotor2', motor_pwm_rotmin, motor_rot_pwmmin],
			['w', 'Moteur 2 : Définir PWM à %d pour vitesse max %d ',   	'setConfigMaxMotor2', motor_pwm_rotmax, motor_rot_pwmmax],

		],
	menus: {
		inputNb 	: [0, 1, 2],
		outputName 	: ['Buzzer', 'LED'],
		dirMode1	: ['Inverser', 'Conserver'],
		cfgMode1	: ['ANGLE', 'VITESSE'],
		pwmMode1	: ['PWM', 'ANGLE', 'VITESSE'],
		pwmMode2	: ['PWM', 'VITESSE'],
		}
	};
	ScratchExtensions.register('Rooby', descriptor, ext, {type: 'hid', vendor:0x0fd7, product:0x5010}); //ICE_ID  "Vid_0fd7&Pid_5010"	
})();
