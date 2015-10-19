// http://scratchx.org/?url=http://jeulindev.github.io/GroomyScratch/GroomyStartProject.sbx
// http://scratchx.org/?url=http://jeulindev.github.io/GroomyScratch/groomy_extension_fr.js

var time = 100;
var waitingTimeRead  = 100;
var waitingTimeWrite =  50;
var myReq = undefined;
function SqueereHTTP(url, instance)
{
    this.loaded 	= false;
    this.waiting 	= 0;
    this.url		= url;
    this.script;
    this.firstparam	= true;
    this.serverResponse;
    this.instance	= instance;
    that			= this;

    this.AddParam = function(p, v)
    {
        if (that.firstparam)
        {
            that.url+='?'+p+'='+v;
            that.firstparam=false;
        }
        else
        {
            that.url+='&'+p+'='+v;
        }
    }


    this.onComplete = function(serverResponse)
    {
		//alert('20');
    }

    this.onLoad = function()
    {
		if (that.loaded)
        {
            return;
        }
		//d = new Date();; console.log("clear1 ("+that.waiting+"):"+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+":"+d.getMilliseconds());
		if (that.waiting == 1)
		{
			that.waiting = 2;
		} else {
			that.loaded = true;
		}

   }

    this.Request = function(force)
    {
        /*that.AddParam('instance', that.instance);
        if (force)
        {
            var mydate = new Date();
            var zmydate = mydate.getTime();
            that.AddParam('date', zmydate);
        }*/
        that.script = document.createElement('script');
        that.script.setAttribute('charset','UTF-8');
        that.script.setAttribute('type','text/javascript');
        that.script.setAttribute('src', that.url);
        that.script.onload = that.onLoad;
        that.script.onreadystatechange = that.onLoad;
		that.loaded  = false;
		that.waiting = 1;
		document.getElementsByTagName('head')[0].appendChild(that.script);
		
 		window.setTimeout(function() { 
			if (myReq.waiting == 2)
			{
				myReq.loaded 	= true;
				myReq.waiting  	= 0;
				//d = new Date();; console.log("clear2 :"+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+":"+d.getMilliseconds());
			} else {
				that.waiting = 0;
			}

			
		}, waitingTimeRead);
   }

    return this;
}

function getEtatFromMasque(zData, iIndex)
{
    try
    {
        if (zData == null)
        {
            return '0';
        }

        if (iIndex >= zData.length)
        {
            return '0';
        }
        return zData.charAt(iIndex);
    }
    catch (err)
    {
        //alert("getEtatFromMasque " + err);
        return '0';
    }
}


function getValueFor(zData, zMyClef)
{
    try
    {
        var lesLignes = zData.split(';');
        for (var i=0; i < lesLignes.length; i++)
        {
            var uneLigne = lesLignes[i];
            if (uneLigne.length > 1)
            {
                var iSeparateur = uneLigne.indexOf('=');
                if (iSeparateur != -1)
                {
                    var zClef = uneLigne.substring(0, iSeparateur);
                    var zVal  = uneLigne.substring(iSeparateur + 1, uneLigne.length);
                    if (zClef == zMyClef)
                    {
                        return zVal;
                    }
                }
            }
        }
        return null;
    }
    catch (err)
    {
        //alert("getValueFor " + err);
        return null;
    }
}

SNum = [-1, -1,-1,-1,-1,-1,-1,-1,-1];
SAna = [-1, -1,-1];
ENum = [-1, -1,-1,-1,-1,-1,-1,-1,-1];
EAna = [-1, -1,-1,-1,-1];

function UpdateEtat(zData)
{
    //alert('UpdateEtat');
	try
    {
        var zValeur = "";
        var cEtat 	= '0';
        var i 		= 0;
        var bErreur = false;


        if (!zData)
        {
			return;
        }
        /////////////////////
        // Sorties Numeriques
        zValeur = getValueFor(zData, 'SNUM');
        if (zValeur)
        {
            giNbSNUM = 8;
			for (i = 1; i <= giNbSNUM; i++)
            {
                // les caracteres sont inverses par rapport aux numeros des sorties
                cEtat = getEtatFromMasque(zValeur, (giNbSNUM - i));
                // recherche dans les donnees si on a SNUM=?? le ?? est retourne par la fonction
                SNum[i] = parseInt(cEtat);               
            }
        }
        //////////////////////
        // Sorties Analogiques
		giNbSANA = 2;
        for (i = 1; i <= giNbSANA; i++)
        {
            zValeur = getValueFor(zData, 'SANA' + i);
            if (zValeur)
            {
                SAna[i]=parseInt(zValeur);
            }
        }	
		
        /////////////////////
        // Entrees Numeriques
		zValeur = getValueFor(zData, 'ENUM');
        if (zValeur)
        {
            giNbENUM = 8;
			for (i = 1; i <= giNbENUM; i++)
            {
                // les caracteres sont inverses par rapport aux numeros des sorties
                cEtat = getEtatFromMasque(zValeur, (giNbENUM - i));

                // recherche dans les donnees si on a SNUM=?? le ?? est retourne par la fonction
                ENum[i] = parseInt(cEtat);
				//console.log("ENum ["+i+"]=>"+ENum[i]);
               
            }
        }
		
        //////////////////////
        // entree Analogiques*
		giNbEANA = 4;
        for (i = 1; i <= giNbEANA; i++)
        {
            zValeur = getValueFor(zData, 'EANA' + i);
            EAna[i] = parseInt(zValeur);
        }		
		
/*
        /////////////////////
        // Sorties relais
        zValeur = getValueFor(zData, 'SRELAIS');
        if (zValeur)
        {
            for (i = 1; i <= giNbSRELAIS; i++)
            {
                //  les caracteres sont inverses par rapport aux numeros des sorties
                cEtat = getEtatFromMasque(zValeur, (giNbSRELAIS - i));

                // recherche dans les donnees si on a SNUM=?? le ?? est retourne par la fonction
                if (cEtat == '1')
                {
                    if (i==1) R1=1;
                    if (i==2) R2=1;
                    if (i==3) R3=1;
                    if (i==4) R4=1;
                }
                else
                {
                    if (i==1) R1=0;
                    if (i==2) R2=0;
                    if (i==3) R3=0;
                    if (i==4) R4=0;
            }   
        }
*/
    }
    catch(err)
    {
        //alert(err);
        return;
    }
}




function JlnEtatGroomy(zEtat)
{
	UpdateEtat(zEtat);
	//d = new Date();; console.log("update :"+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+":"+d.getMilliseconds());
}

function waitDInput2(param1, param2, callback) 
{
	refresh = false;
	if (ENum[parseInt(param1)]==-1)
	{
		//console.log ('Not init yet');
		refresh = true;
	} else {
	
		if (ENum[parseInt(param1)] = parseInt(param2))
		{
			//console.log ('Stop Enum['+parseInt(param1)+']='+ENum[parseInt(param1)]);
			refresh = false;
			callback();
		} else {
			//console.log ('Request Enum['+parseInt(param1)+']='+ENum[1]);
			refresh = true;
			myReq = new SqueereHTTP('http://' + $ip +'/etat2.htm', 'myReq');
			myReq.Request(true);
		}
	}
	if (refresh)
	{
		window.setTimeout(function() { waitDInput2(param1, param2, callback); }, waitingTimeRead, param1, param2, callback);
	}
	
}

var writeT = 0;
function SetOutput(da, number, value, callback)
{
	//-- generate new command
	if (da)
	{
		var snum = '';
		for (var i=7; i>=0; i--)
		{
			if (i==(number-1))
			{
				snum = snum+value;
			} else {
				snum = snum+'x';
			}
		}
		output = {
			type  : "SNUM=",
			value : snum
		}
	} else {
		output = {
			type  : 'SANA'+number+'=',
			value : value
		}	
	}

	if (writeT==0)
	{	
		//-- get iframe
		jIframe =  $('#myframejeulin');
		if (jIframe.length==0) {
			jIframe = 		$('<iframe id="myframejeulin" src="." style="position:absolute;z-index:1; top: 68px; left: 203px;width:200px;height:200px;visibility:hidden"></iframe>').appendTo($(document).find(':first-child'));
		} 
			
		//-- send cmd
		$cmd = "http://"+$ip+"/etat.htm?"+output.type+output.value;
		jIframe.attr('src', $cmd );
		//console.log($cmd);
		
		//-- return
		writeT = window.setTimeout(function() {
			callback();
			writeT =  0;
		}, waitingTimeWrite);
	} else {
		//callback();
		console.log('wait command');
		writeT = window.setTimeout(function() {
			SetOutput(da, number, value, callback);
		}, waitingTimeWrite, da, number, value, callback);
	}
}




$ip = "10.0.2.221";//
(function(ext) {
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };
	
	//-----------------------------------------------------------
	//--
	//--		Init groomy IP
	//--
	//-----------------------------------------------------------	
	ext.initGroomy = function(param1, param2, param3, param4, callback) {
		$ip 	= param1+"."+param2+"."+param3+"."+param4;
		myReq 	= undefined;
		SNum 	= [-1, -1,-1,-1,-1,-1,-1,-1,-1];
		SAna 	= [-1, -1,-1];
		ENum 	= [-1, -1,-1,-1,-1,-1,-1,-1,-1];
		EAna 	= [-1, -1,-1,-1,-1];
		callback();
		return true;
	}
	

	//-----------------------------------------------------------
	//--
	//--		
	//--
	//-----------------------------------------------------------
	ext.waitDInput = function(param1, param2, callback) {
		//window.setTimeout(waitDInput2, 500, param1, param2, callback);
	}
	
	//-----------------------------------------------------------
	//--
	//--		
	//--
	//-----------------------------------------------------------
	ext.readDInput = function(param1, callback) {
		if ((myReq==undefined) || ((myReq!=undefined) && (myReq.loaded==true)))
		{
			myReq = new SqueereHTTP('http://' + $ip +'/etat2.htm', 'myReq');
			myReq.Request(true);
			//d = new Date();; console.log("send request :"+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+":"+d.getMilliseconds());
		}
        return ENum[parseInt(param1)];
	}
	
	//-----------------------------------------------------------
	//--
	//--		
	//--
	//-----------------------------------------------------------
	ext.readAInput = function(param1, callback) {
		if ((myReq==undefined) || ((myReq!=undefined) && (myReq.loaded==true)))
		{
			myReq = new SqueereHTTP('http://' + $ip +'/etat2.htm', 'myReq');
			myReq.Request(true);
			//d = new Date(); console.log("send request :"+d.getHours()+":"+d.getMinutes()+":"+d.getSecond()+":"+d.getMilliseconds());
		}
        return EAna[parseInt(param1)];
	}	
	
	//-----------------------------------------------------------
	//--
	//--		
	//--
	//-----------------------------------------------------------
	ext.readDOutput = function(param1, callback) {
		if ((myReq==undefined) || ((myReq!=undefined) && (myReq.loaded==true)))
		{
			myReq = new SqueereHTTP('http://' + $ip +'/etat2.htm', 'myReq');
			myReq.Request(true);
			//d = new Date(); console.log("send request :"+d.getHours()+":"+d.getMinutes()+":"+d.getSecond()+":"+d.getMilliseconds());
		}
        return SNum[parseInt(param1)];
	}
	
	//-----------------------------------------------------------
	//--
	//--		Set Analog Output
	//--
	//-----------------------------------------------------------
	ext.readAOutput = function(param1, callback) {
		if ((myReq==undefined) || ((myReq!=undefined) && (myReq.loaded==true)))
		{
			myReq = new SqueereHTTP('http://' + $ip +'/etat2.htm', 'myReq');
			myReq.Request(true);
			//d = new Date(); console.log("send request :"+d.getHours()+":"+d.getMinutes()+":"+d.getSecond()+":"+d.getMilliseconds());
		}
        return SAna[parseInt(param1)];
	}	

	//-----------------------------------------------------------
	//--
	//--		Set Digital Output
	//--
	//-----------------------------------------------------------	
	ext.setDOutput = function(param1, param2, callback) {
		
		SetOutput (true, param1, param2, callback);
		return true;
	};
	
	//-----------------------------------------------------------
	//--
	//--		Set Analog Output
	//--
	//-----------------------------------------------------------
	ext.setAOutput = function(param1, param2, callback) {
		
		SetOutput (false, param1, param2, callback);
		return true;
	};
	
    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            // Block type, block name, function name
			['w', 'set address %s.%s.%s.%s', 'initGroomy', '10', '0', '2', '221'],
			//--
			['r', 'Lire entrée numérique %m.DigitalNumber',  	'readDInput',  1 ],
			['r', 'Lire entrée analogique %m.AnalogNumber4',   	'readAInput',  1 ],
			['r', 'Lire sortie numérique %m.DigitalNumber',  	'readDOutput', 1 ],
			['r', 'Lire sortie analogique %m.AnalogNumber2',   	'readAOutput', 1 ],
			//--
			['w', 'Affecter sortie numérique %m.DigitalNumber à %m.DigitalValues', 'setDOutput', 1, 0],
			['w', 'Affecter sortie analogique %m.AnalogNumber2 à %s', 'setAOutput', 1, '  0'],		
		],
		menus: {
			DigitalNumber	: [1, 2, 3, 4, 5, 6, 7, 8],
			AnalogNumber2	: [1, 2],
			AnalogNumber4	: [1, 2, 3, 4],
			DigitalValues	: [0, 1]
		}
    };

    // Register the extension
    ScratchExtensions.register('Groomy extension', descriptor, ext);
	
}) ({});
