/* Magic Mirror
 * Module: MMM-CustomMessage
 *
 * By jpcaldwell30
 * MIT Licensed.
 */
// Declare variables for custom header and module body
var customHeader;
var moduleBody;

// Register the module with the MagicMirror framework
Module.register("MMM-CustomMessage", {

    // Define default module configuration
    defaults: {
        initialHeaderText: {
            "value":"" // Initial header text value
        },
        initialText: {
			"value": "" // Initial text value
        },
        fontSize: {
            "value": "" // Font size value
        },
        headerFontSize: {
            "value": "" // Header font size value
        },
        enableHistory: {
			"value": "false" // Enable history value
		},
        resetMessage: {
            "enabled": "false", // Reset message enabled value
            "time": "00:00" // Reset message time in 24 hour format
        },     
    },

    // Function called when the module starts
    start: function() {
        console.log('[' + this.name + '] Initial Start'); // Log initial start message
        this.sendResetConfig(); // Send reset configuration
    },

    // Function to send reset configuration
    sendResetConfig: function() {
        let resetConfig = this.config.resetMessage; // Get reset message from config
        console.log(this.name + "Sending reset message enabled with config: " + JSON.stringify(resetConfig)); // Log reset message configuration
        this.sendSocketNotification('RESET_MESSAGE_CONFIG', resetConfig); // Send socket notification with reset message configuration
    },

    // Function to get custom styles from config.js file
    getStyles: function() {
        return ["modules/MMM-CustomMessage/css/MMM-CustomMessage.css"]; 
    },

        // Override DOM generator function.
    getDom: function() {
        var wrapper = document.createElement("div"); // Create a new div element

        /* Define helper functions to get text, header text, font size, and header font size from config */
        var getText = () => {
            var txt = this.config.initialText["value"];
            return txt;
        };

        var getHeaderText = () => {
            var txt = this.config.initialHeaderText["value"];
            return txt;
        };

        var getFontSize = () => {
            var fontSize = this.config.fontSize["value"]; //raw font size value no units
            return fontSize;
        };

        var getHeaderFontSize = () => {
            var fontSize = this.config.headerFontSize["value"]; //raw font size value no units
            return fontSize;
        };

        /* Get initial header text and initial text */
        initialHeaderText = getHeaderText();
        initialText = getText();

        /* Create custom header div */
        customHeader = document.createElement("div");
        customHeader.classList.add("module-content", "customHeader");
        customHeader.innerHTML = initialHeaderText;   
        customHeader.style.fontSize = getHeaderFontSize;

        /* Create module body div */
        moduleBody = document.createElement("div");
        moduleBody.classList.add("module-content");
        moduleBody.innerHTML = initialText;
        moduleBody.style.fontSize = getFontSize();
        moduleBody.contentEditable = "true"

      /* If history is enabled, read content from local file */
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
                    if (payload.message == "/clear" || payload.message == "\\clear"){ //if you forget which type of slash to use for the command...
                        // Clear the inner HTML of the module body and custom header
                        moduleBody.innerHTML = "";
                        customHeader.innerHTML = "";
                    }
                }
			});
	    }

       /* Append custom header and module body to wrapper */
       wrapper.appendChild(customHeader);
       wrapper.appendChild(moduleBody);
       return wrapper; // Return the wrapper element
   },

   /* Function to read content from local file */
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

    // Function to handle socket notifications
    socketNotificationReceived: function (notification, payload) {
        // Log the received message
        console.log(this.name + " received a new message: " + JSON.stringify(payload));

        // If the notification is to reset now
        if (notification == "RESET_NOW") {
            // Clear the inner HTML of the module body and custom header
            moduleBody.innerHTML = "";
            customHeader.innerHTML = "";
        }

        // If a new message is received
        if (notification == "NEW_MESSAGE_RECEIVED") {
            // If there's a message in the payload
            if (payload.message)
            {
                // Log the application of the message
                console.log(this.name + " applying message: " + payload.message);
                // Set the inner HTML of the module body to the message
                moduleBody.innerHTML = payload.message;
            }
            // If there's a header message in the payload
            if (payload.messageHeader)
            {
                // Set the inner HTML of the custom header to the header message
                customHeader.innerHTML = payload.messageHeader;
                // Log the application of the header message
                console.log(this.name + " applying message: " + payload.messageHeader);
            }
            if (payload.message == "/clear" || payload.message == "\\clear"){ //if you forget which type of slash to use for the command...
                // Clear the inner HTML of the module body and custom header
                moduleBody.innerHTML = "";
                customHeader.innerHTML = "";
            }
        }
    },
});
