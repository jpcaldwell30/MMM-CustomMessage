/* Magic Mirror
 * Module: MMM-CustomMessage
 *
 * By jpcaldwell30
 * MIT Licensed.
 */
// Declare variables for custom header and module body
var moduleHeader;
var moduleBody;
var enabledModuleCollapse;

// Register the module with the MagicMirror frameworkF
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
        enableModuleCollapse: {
            "enabled": "false" // Enable collapsing the hieght of 
        }     
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

        var getModuleCollapse = () => {
            var enabled = this.config.enableModuleCollapse["enabled"]; //raw font size value no units
            return enabled;
        };

        /* Get initial header text and initial text */
        initialHeaderText = getHeaderText();
        initialText = getText();

        /* Create custom header div */
        moduleHeader = document.createElement("div");
        moduleHeader.classList.add("module-content", "moduleHeader");
        moduleHeader.innerHTML = initialHeaderText;   
        moduleHeader.style.fontSize = getHeaderFontSize();

        /* Create module body div */
        moduleBody = document.createElement("div");
        moduleBody.classList.add("module-content", "moduleBody");
        moduleBody.innerHTML = initialText;
        moduleBody.style.fontSize = getFontSize();
        moduleBody.contentEditable = "true"
        
        enabledModuleCollapse = getModuleCollapse();

        if (enabledModuleCollapse == "true") {
            if (!initialHeaderText) {
                moduleHeader.style.height = 0;
            } 
        } else {
            moduleHeader.style.removeProperty('height');
        }

      /* If history is enabled, read content from local file */
        if (this.config.enableHistory["value"] == "true") {			
			this.readFileContent(function (response) {
                console.log(this.name + " read from file: " + response);
                if (response != ""){
                    let jsonResponse = JSON.parse(response);
                    // If there's a message in the payload
                    if (jsonResponse.messageHeader || jsonResponse.message) {
                        if (jsonResponse.message.includes("/clear") || jsonResponse.message.includes("\\clear")){ //if you forget which type of slash to use for the command...
                            console.log(this.name + " received clear command, clearing message...");   
                            moduleBody.innerHTML = "";
                            moduleHeader.innerHTML = "";
                            if (enabledModuleCollapse == "true") {
                                moduleHeader.style.height = 0;
                            } else {
                                moduleHeader.style.removeProperty('height');
                            }
                        } else {
                            if (jsonResponse.messageHeader) {
                                // Log the application of the message
                                console.log(this.name + " applying header: " + jsonResponse.messageHeader);
                                // Set the inner HTML of the module body to the message
                                moduleHeader.innerHTML = jsonResponse.messageHeader;
                                if (enabledModuleCollapse == "true") {
                                    moduleHeader.style.removeProperty('height');
                                }
                            } else {
                                if (enabledModuleCollapse == "true") {
                                    moduleHeader.style.height = 0;
                                }
                            }
                            if (jsonResponse.message) {
                                // Log the application of the message
                                console.log(this.name + " applying message: " + jsonResponse.message);
                                // Set the inner HTML of the module body to the message
                                var cleanedMessage = payload.message.replace(/^<p>(.*?)<\/p>/, "$1 ");
                                moduleBody.innerHTML = cleanedMessage;
                            }
                        }
                    }
                }
            });
        }
       /* Append custom header and module body to wrapper */
       wrapper.appendChild(moduleHeader);
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
            moduleHeader.innerHTML = "";
            if (enabledModuleCollapse == "true") {
                moduleHeader.style.height = 0;
            } else {
                moduleHeader.style.removeProperty('height');
            }
        }

        // If a new message is received
        if (notification == "NEW_MESSAGE_RECEIVED") {
            // If there's a message in the payload
            if (payload.messageHeader || payload.message) {
                if (payload.message.includes("/clear") || payload.message.includes("\\clear")){ //if you forget which type of slash to use for the command...
                    console.log(this.name + " received clear command, clearing message...");   
                    moduleBody.innerHTML = "";
                    moduleHeader.innerHTML = "";
                    if (enabledModuleCollapse == "true") {
                        moduleHeader.style.height = 0;
                    } else {
                        moduleHeader.style.removeProperty('height');
                    }
                } else {
                    if (payload.messageHeader) {
                        // Log the application of the message
                        console.log(this.name + " applying header: " + payload.messageHeader);
                        // Set the inner HTML of the module body to the message
                        moduleHeader.innerHTML = payload.messageHeader;
                        if (enabledModuleCollapse == "true") {
                            moduleHeader.style.removeProperty('height');
                        }
                    } else {
                        if (enabledModuleCollapse == "true") {
                            moduleHeader.style.height = 0;
                        }
                    }
                    if (payload.message) {
                        // Log the application of the message
                        console.log(this.name + " applying message: " + payload.message);
                        // Set the inner HTML of the module body to the message
                        var cleanedMessage = payload.message.replace(/^<p>(.*?)<\/p>/, "$1 ");
                        moduleBody.innerHTML = cleanedMessage;
                    }
                }
            } 
        }
    }
});
