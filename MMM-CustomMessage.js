/* MagicMirror²
 * Module: MMM-CustomMessage
 *
 * By jpcaldwell30
 * MIT Licensed.
 */
// Declare variables for custom header and module body
let moduleHeader;
let moduleBody;
let enableModuleCollapse;
let moduleCollapseType;
let enableClearingOfMessage;
let clearingTime;
let enableHistory;

Module.register("MMM-CustomMessage", {
    // Define default module configuration
    defaults: {
        uniqueID: "",
        initialHeaderMessage: "",
        headerFontSize: "",
        initialBodyMessage: "",
        bodyFontSize: "",
        enableHistory: false,
        enableMessageExpiration: {
            enabled: false,
            clearAt: "00:00",
        },
        enableCollapsibleEmptyField: {
            enabled: false,
            fieldToCollapse: "header"
        }     
    },

    start() {
        console.log(`[${this.name}] (${this.config.uniqueID}) Initial Start`);
        //Log.log(`[${this.name}] (${this.config.uniqueID}) Initial Start`);
        this.sendConfig();
    },

    sendConfig() {
        /*const newData = {
            uniqueId: this.config.uniqueID,
            enableHistory: this.config.enableHistory,
            enableMessageExpiration: { 
                enabled: enableClearing,
                clearAt: clearAt
            }, //defaults
            newMessage: {
                newMessageBody: messageBody,
                newMessageHeader: messageHeader,
                clearAt: clearAt
            }
        } */
        const ConfigToSend = {
            uniqueID: this.config.uniqueID,
            enableHistory: this.config.enableHistory,
            initialHeaderMessage: this.config.initialHeaderMessage,
            initialBodyMessage: this.config.initialBodyMessage,
            enableMessageExpiration: this.config.enableMessageExpiration,
        }
        
        console.log(`[${this.name}] (${this.config.uniqueID}) Sending reset message enabled with config: ${JSON.stringify(ConfigToSend)}`);
        this.sendSocketNotification('MMM-CUSTOM_MESSAGE_CONFIG', ConfigToSend);
    },

    getCustomStyles() {
        return ["modules/MMM-CustomMessage/css/MMM-CustomMessage.css"];
    },

    getDom() {
        const wrapper = document.createElement("div");
        wrapper.id = `mmm-custom-message-${this.config.uniqueID}`;

        // Helper functions remain the same
        const getText = () => this.config.initialBodyMessage;
        const getHeaderText = () => this.config.initialHeaderMessage;
        const getFontSize = () => this.config.bodyFontSize;
        const getHeaderFontSize = () => this.config.headerFontSize;
        const getModuleCollapse = () => this.config.enableCollapsibleEmptyField.enabled;
        const getModuleCollapseType = () => this.config.enableCollapsibleEmptyField.fieldToCollapse;

        // Get initial values
        var initialHeaderText = getHeaderText();
        var initialBodyText = getText();

        // Create header
        moduleHeader = document.createElement("div");
        moduleHeader.id = `mmm-custom-message-module-header-${this.config.uniqueID}`;
        moduleHeader.classList.add("module-content", "moduleHeader");
        moduleHeader.innerHTML = initialHeaderText;
        moduleHeader.style.fontSize = getHeaderFontSize();

        // Create body
        moduleBody = document.createElement("div");
        moduleBody.id = `mmm-custom-message-module-body-${this.config.uniqueID}`;
        moduleBody.classList.add("module-content", "moduleBody");
        moduleBody.innerHTML = initialBodyText;
        moduleBody.style.fontSize = getFontSize();

        // Handle collapsible fields
        enabledModuleCollapse = getModuleCollapse();
        fieldToCollapse = getModuleCollapseType();


        if (enabledModuleCollapse && (!initialHeaderText || initialHeaderText === "") && fieldToCollapse === "header") {
            moduleHeader.style.height = 0;
        } else {
            moduleHeader.style.removeProperty('height');
        }
        
        if (enabledModuleCollapse && (!initialBodyText || initialBodyText === "") && fieldToCollapse === "body") {
            moduleBody.style.height = 0;
        } else {
            moduleBody.style.removeProperty('height');
        }

        // Append elements
        wrapper.appendChild(moduleHeader);
        wrapper.appendChild(moduleBody);
        return wrapper;
    },

    clearDisplay() {
        let moduleBody = document.getElementById(`mmm-custom-message-module-body-${this.config.uniqueID}`);
        let moduleHeader = document.getElementById(`mmm-custom-message-module-header-${this.config.uniqueID}`);
        moduleBody.innerHTML = "";
        moduleHeader.innerHTML = "";
        this.handleCollapse();
    },

    updateDisplay(messageData) {
        let moduleBody = document.getElementById(`mmm-custom-message-module-body-${this.config.uniqueID}`);
        let moduleHeader = document.getElementById(`mmm-custom-message-module-header-${this.config.uniqueID}`);
        if (messageData.newMessageHeader) {
            moduleHeader.style.removeProperty("height");
            moduleHeader.innerHTML = messageData.newMessageHeader.replace(/^<p>(.*?)<\/p>/, "$1 ");
        } else if (enabledModuleCollapse && fieldToCollapse === "header") {
            moduleHeader.style.height = 0;
        }

        if (messageData.newMessageBody) {
            moduleBody.style.removeProperty("height");
            const cleanedMessage = messageData.newMessageBody.replace(/^<p>(.*?)<\/p>/, "$1 ");
            moduleBody.innerHTML = cleanedMessage;
        } else if (enabledModuleCollapse && fieldToCollapse === "body") {
            moduleBody.style.height = 0;
        }
    },

    handleCollapse() {
        let moduleBody = document.getElementById(`mmm-custom-message-module-body-${this.config.uniqueID}`);
        let moduleHeader = document.getElementById(`mmm-custom-message-module-header-${this.config.uniqueID}`);
        if (enabledModuleCollapse && fieldToCollapse === "header") {
            moduleHeader.style.height = 0;
        } else {
            moduleHeader.style.removeProperty("height");
        }
        if (enabledModuleCollapse && fieldToCollapse === "body") {
            moduleBody.style.height = 0;
        } else {
            moduleBody.style.removeProperty("height");
        }
    },

    socketNotificationReceived(notification, payload) {
        if (payload.uniqueID !== this.config.uniqueID) {
            return;
        }
        
        console.log(`[${this.name}] (${this.config.uniqueID}) received a payload: ${JSON.stringify(payload)}`);

        if (notification === "MMM-CUSTOM_MESSAGE_RESET_NOW") {
            this.clearDisplay();
        }

        if (notification === "MMM-CUSTOM_MESSAGE_UPDATE_FROM_SERVER") {
            
            const messageData = payload.message;
            if (messageData) {
                if (messageData.newMessageBody?.includes("/clear") || messageData.newMessageBody?.includes("\\clear")) {
                    this.clearDisplay();
                } else {
                    this.updateDisplay(messageData);
                }
            }
        }

        if (notification === "MMM-CUSTOM_MESSAGE_ERROR") {
            Log.error(`[${this.name}] (${this.config.uniqueID}) Error: ${payload.error}`);
            // Optionally display error in the module
            moduleBody.innerHTML = `Error: ${payload.error}`;
        }
    }
});