/* Magic Mirror
 * Module: MMM-CustomMessage
 *
 * By jpcaldwell30
 * MIT Licensed.
 */
var customHeader;
var moduleBody;
Module.register("MMM-CustomMessage", {

    defaults: {
        initialHeaderText: {
            "value":""
        },
        initialText: {
			"value": ""
        },
        fontSize: {
            "value": ""
        },
        headerFontSize: {
            "value": ""
        },
        enableHistory: {
			"value": "false"
		},
        resetMessage: {
            "enabled": "false",
            "time": "00:00" //24 hour time
        },     
    },
    start: function() {
        console.log('[' + this.name + '] Initial Start');
        this.sendResetConfig();
    },

    sendResetConfig: function() {
        let resetConfig = this.config.resetMessage;
        console.log(this.name + "Sending reset message enabled with config: " + JSON.stringify(resetConfig));
        this.sendSocketNotification('RESET_MESSAGE_CONFIG', resetConfig);
    },

    // Gets correct css file from config.js
    getStyles: function() {
        return ["modules/MMM-CustomMessage/css/MMM-CustomMessage.css"]; // default.css
    },

      // Override dom generator.
    getDom: function() {
      var wrapper = document.createElement("div");

        var getText = () => {
            var txt = this.config.initialText["value"];
            return txt;
        };

        var getHeaderText = () => {
            var txt = this.config.initialHeaderText["value"];
            return txt;
        };

        var getFontSize = () => {
            var fontSize = this.config.fontSize["value"];
            return fontSize;
        };

        var getHeaderFontSize = () => {
            var fontSize = this.config.headerFontSize["value"];
            return fontSize;
        };

        initialHeaderText = getHeaderText();
        initialText = getText();

        customHeader = document.createElement("div");
        customHeader.classList.add("module-content", "customHeader");
        customHeader.innerHTML = initialHeaderText;   
        customHeader.style.fontSize = getHeaderFontSize;

        moduleBody = document.createElement("div");
        moduleBody.classList.add("module-content");
        moduleBody.innerHTML = initialText;
        moduleBody.style.fontSize = getFontSize();
        moduleBody.contentEditable = "true"

        if (this.config.enableHistory["value"] == "true") {			
			this.readFileContent(function (response) {
                console.log(this.name + " read from file: " + response);
                if (response != ""){
                    let jsonResponse = JSON.parse(response);
                    if (jsonResponse.message){
                        moduleBody.innerHTML = jsonResponse.message
                    }
                    if (jsonResponse.messageHeader){
                        customHeader.innerHTML = jsonResponse.messageHeader
                    }
                    if (jsonResponse.message == "/clear"){
                        moduleBody.innerHTML = "";
                        customHeader.innerHTML = "";
                    }
                }
			});
		}

        wrapper.appendChild(customHeader);
        wrapper.appendChild(moduleBody);
        return wrapper;
    },

    //Read content from local file
	readFileContent: function (callback) {
		var xobj = new XMLHttpRequest(),
			path = this.file('message-history.json');
		xobj.overrideMimeType("application/json");
		xobj.open("GET", path, true);
		xobj.onreadystatechange = function () {
			if (xobj.readyState === 4 && xobj.status === 200) {
				callback(xobj.responseText);
			}
		};
		xobj.send(null);
	},

    socketNotificationReceived: function (notification, payload) {
        console.log(this.name + " received a new message: " + JSON.stringify(payload));
        if (notification == "RESET_NOW") {
            moduleBody.innerHTML = "";
            customHeader.innerHTML = "";
        }
        if (notification == "NEW_MESSAGE_RECEIVED") {
            if (payload.message)
            {
                console.log(this.name + " applying message: " + payload.message);
                moduleBody.innerHTML = payload.message;
            }
            if (payload.messageHeader)
            {
                customHeader.innerHTML = payload.messageHeader;
                console.log(this.name + " applying message: " + payload.messageHeader);
            }
            if (payload.message == "/clear"){
                moduleBody.innerHTML = "";
                customHeader.innerHTML = "";
            }            
	    if (payload.message == "\\clear"){
                moduleBody.innerHTML = "";
                customHeader.innerHTML = "";
            }
        }
    },
});
