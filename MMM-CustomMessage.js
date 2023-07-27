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
        webhookHeaderText: {
            "value": ""
        },
        webhookText: {
            "value": ""
        },
        maxWidth: {
            "value":"100%"
        },
        updateInterval: {
            "value":30 * 60 * 1000
        },
        fontSize: {
            "value": ""
        },
        headerFontSize: {
            "value": ""
        },
        filePath: {
			"value": ""
		},
        fileContent: {
			"value": ""
		},

        //TODO handle header text size
    },
    start: function() {
        console.log('[' + this.name + '] Starting');
        this.sendSocketNotification('START', this.config);
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

        var getFilePath = () => {
            var filePath = this.config.filePath["value"];
            return filePath;
        };

        initialHeaderText = getHeaderText();
        customHeader = document.createElement("div");
        customHeader.classList.add("module-content", "customHeader");
        customHeader.innerHTML = initialHeaderText;   
        customHeader.style.fontSize = getHeaderFontSize;
        wrapper.appendChild(customHeader);
        
        initialText = getText();
        moduleBody = document.createElement("div");
        moduleBody.classList.add("module-content");
        // Read the saved file and insert text here    (directly below this text) if possible !!!!!
        moduleBody.innerHTML = initialText;
        moduleBody.style.fontSize = getFontSize();
        moduleBody.contentEditable = "true"
        wrapper.appendChild(moduleBody);

        
        if (getFilePath() !== "") {			
			this.readFileContent(function (response) {
				this.config.fileContent["value"] = response.replace(/(?:\r\n|\r|\n)/g, '<br>');
				moduleBody.innerHTML = this.config.fileContent["value"];
			});
		}
        return wrapper;
    },

    refresh: function() {
        this.updateDom();
        setTimeout( () => {
            this.refresh();
        }, this.config.updateInterval["value"]);
    },

    //Read content from local file
	readFileContent: function (callback) {
		var xobj = new XMLHttpRequest(),
			path = this.file(this.config.filePath["value"]);
		xobj.overrideMimeType("application/text");
		xobj.open("GET", path, true);
		xobj.onreadystatechange = function () {
			if (xobj.readyState === 4 && xobj.status === 200) {
				callback(xobj.responseText);
			}
		};
		xobj.send(null);
	},

    socketNotificationReceived: function (notification, payload) {
        console.log(this.name + " received a new message: " + payload);
        if (notification == "NEW_MESSAGE_RECEIVED") {
            if (payload.message)
            {
                moduleBody.innerHTML = payload.message;
            }
            if (payload.messageHeader)
            {
                customHeader.innerHTML = payload.messageHeader;
            }
            console.log(this.name + "applying message:" + payload.message);
            if(payload.messageHeader)
            {
                console.log(this.name + "applying message:" + payload.messageHeader);
            }
        }
    },
});
