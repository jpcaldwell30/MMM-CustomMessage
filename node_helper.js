/* MagicMirror²
 * Module: MMM-CustomMessage
 *
 * By jpcaldwell30
 * MIT Licensed.
 */
// Import required modules
const NodeHelper = require('node_helper');
const bodyParser = require('body-parser');
const spacetime = require('spacetime');
const Log = require("logger");
const fs = require('fs');

// Export the module
module.exports = NodeHelper.create({
    // Function called when the module starts
    start () {
        this.resetTimers = {};
        console.log(`${this.name} helper started`); // Log that the helper has started
        this.handleApiRequest(); // Handle API requests
        this.historyFilePath = "modules/MMM-CustomMessage/message-history.json";
    },

    async getEntryByUniqueID(uniqueID) {
        try {
            // Read the file content
            const fileContent = fs.readFileSync(this.historyFilePath, 'utf8');
    
            // Parse the JSON content
            const data = JSON.parse(fileContent);
    
            // Retrieve the entry for the given uniqueID
            const entry = data[uniqueID];
    
            if (entry) {
                return entry;
            } else {
                console.warn(`No entry found for uniqueID: ${uniqueID}`);
                return null;
            }
        } catch (error) {
            console.error('Error reading or parsing the file:', error);
            return null;
        }
    },

    async writeJsonHistory(newData){
        
        // const config = { 
        //     uniqueId: uniqueID,
        //     enableHistory: this.config.enableHistory,
        //     initialHeaderMessage: this.config.initialHeaderMessage,
        //     initialBodyMessage: this.config.initialBodyMessage,
        //     enableMessageExpiration: { 
        //         enabled: enableExpiration,
        //         clearAt: clearAt
        //     },
        //     message: {
        //         newMessageBody: messageBody,
        //         newMessageHeader: messageHeader,
        //         clearAt: clearAt
        //     }   
        // }

        let existingData = {};    
        try {
            if (fs.existsSync(this.historyFilePath)) {
                const fileContent = fs.readFileSync(this.historyFilePath, 'utf8');
                if (fileContent.trim()) {
                    existingData = JSON.parse(fileContent);
                    //console.log(`${this.name} existingData:\n${JSON.stringify(existingData, null, 2)}`);
                    // Proceed with using 'data'
                } else {
                    // console.warn('File is empty. Initializing with empty JSON.');
                    // fs.writeFileSync(this.historyFilePath, '{}', 'utf8');
                }
            } else {
                // console.warn('File does not exist. Creating file with empty JSON.');
                // fs.writeFileSync(this.historyFilePath, '{}', 'utf8');
            }
        
            // Extract uniqueId from newData
            const uniqueId = newData.uniqueID;
            if (!uniqueId) {
                throw new Error("newData must contain a uniqueId");
            }

            //console.log(`existingData[uniqueId]:\n${JSON.stringify(existingData[uniqueId], null, 2)}`);
            //console.log(`newData:\n${JSON.stringify(newData, null, 2)}`);
            // Merge newData into the corresponding uniqueId entry
            if (!existingData[uniqueId]) {
                existingData[uniqueId] = newData;
            }

            if (!existingData[uniqueId].enableHistory) {
                existingData[uniqueId] = {
                    ...existingData[uniqueId],  // Preserve existing values
                    ...newData,                  // Overwrite only the provided values
                    message: existingData[uniqueId].message
                };
            } else {
                existingData[uniqueId] = {
                    ...existingData[uniqueId],  // Preserve existing values
                    ...newData                  // Overwrite only the provided values
                };
            }
            console.log(`existingData[uniqueId] after merge:\n${JSON.stringify(existingData[uniqueId], null, 2)}`);
            // Write the merged data to file
            fs.writeFileSync(this.historyFilePath, JSON.stringify(existingData, null, 4));
            console.log("Config file written successfully.");
        } catch (error) {
            console.error('Error writing to file:', error);
            throw error;
        }
    },
    
    validateTimeFormat(timeString) {
        // Check for relative time format (e.g., 2h, 30m, 45s)
        const relativeFormat = /^(\d+)(h|m|s)$/;
        
        // Check for 24-hour format (HH:MM)
        const timeFormat = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        
        // Check for ISO8601 format
        const iso8601Format = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/;
        
        if (relativeFormat.test(timeString)) {
            return 'RELATIVE';
        } else if (timeFormat.test(timeString)) {
            return 'HH:MM';
        } else if (iso8601Format.test(timeString)) {
            return 'ISO8601';
        } else {
            throw new Error(
                `Invalid time format: ${timeString}. Time must be in either:
                - 24-hour format (HH:MM)
                - ISO8601 format
                - Relative format (e.g., 2h, 30m, 45s)`
            );
        }
    },

    parseRelativeTime(timeString) {
        const match = timeString.match(/^(\d+)(h|m|s)$/);
        const value = parseInt(match[1]);
        const unit = match[2];
        
        const now = spacetime.now();
        
        switch(unit) {
            case 'h':
                return now.add(value, 'hours');
            case 'm':
                return now.add(value, 'minutes');
            case 's':
                return now.add(value, 'seconds');
            default:
                throw new Error('Invalid time unit');
        }
    },

    getFormattedTimeDisplay(targetTime, timeFormat, originalTime) {
        const now = spacetime.now();
        
        switch(timeFormat) {
            case 'RELATIVE':
                const diff = targetTime.epoch - now.epoch;
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                return `Next reset in: ${hours}h ${minutes}m ${seconds}s (${originalTime})`;
            case 'HH:MM':
                return `Next reset at: ${targetTime.format('time')}`;
            case 'ISO8601':
                return `Next reset at: ${targetTime.format('nice')}`;
            default:
                return '';
        }
    },

    async manageMessage(message) {
        //console.log(`${this.name} got message fro manageMessage:\n${JSON.stringify(message, null, 2)}`);

        const uniqueID = message.uniqueID;

        if (!uniqueID) {
            console.log(`${this.name} No uniqueID found in message`);
            return;
        }
        //console.log(`${this.name} managing message for uniqueID: ${uniqueID}`);
        const config = await this.getEntryByUniqueID(uniqueID);
        if (!config) {
            console.log(`${this.name} No config found for uniqueID: ${uniqueID}`);
            return;
        }
        //console.log(`${this.name} got config for uniqueID: ${uniqueID}:\n${JSON.stringify(config, null, 2)}`);

        //const defaultMessageExpirationEnabled = config.enableMessageExpiration.enabled;
        //const defaultClearAt = config.enableMessageExpiration.clearAt;
        const enableHistory = config.enableHistory;
        var messageBody;
        var messageHeader;
        var clearAt;
        
        if (message.message?.clearAt != null) {
            clearAt = message.message.clearAt;
        } else if (config.enableMessageExpiration?.enabled) {
            clearAt = config.enableMessageExpiration.clearAt;
        } else if (!config.enableMessageExpiration?.enabled && enableHistory && config.message?.clearAt != null) {
            clearAt = config.message.clearAt;
        }
        
        if (message.message?.newMessageBody != null) {
            messageBody = message.message.newMessageBody;
            messageHeader = message.message.newMessageHeader;
        } else if (config.enableHistory) {
            messageBody = config.message.newMessageBody ?? messageBody;
            messageHeader = config.message.newMessageHeader ?? messageHeader;
        } else {
            messageBody = config.initialBodyMessage ?? messageBody;
            messageHeader = config.initialHeaderMessage ?? messageHeader;
        }

        //console.log(`${this.name} Default clearing enabled: ${defaultMessageExpirationEnabled}, Default clearAt: ${defaultClearAt}`);
        console.log(`${this.name} Message clearAt: ${clearAt}`);

        const newData = {
            uniqueID: uniqueID,
            message: {
                newMessageBody: messageBody,
                newMessageHeader: messageHeader,
            }
        };
        if (messageBody?.includes("/clear") || messageBody?.includes("\\clear")) {
            console.log(`${this.name} Message history included clear command, sending reset now ${uniqueID}`);
            this.sendSocketNotification('MMM-CUSTOM_MESSAGE_RESET_NOW', newData);
        } else {
            console.log(`${this.name} Message history did not include clear command, updating message for ${uniqueID}`);
            this.sendSocketNotification('MMM-CUSTOM_MESSAGE_UPDATE_FROM_SERVER', newData);
        }
    
        if (!clearAt) {
            console.log(`${this.name} No valid clearAt time available. Reset not scheduled.`);
            return;
        }

        try {
            // Validate time format
            const timeFormat = this.validateTimeFormat(clearAt);
            const now = spacetime.now();
    
            let targetTime;
    
            if (timeFormat === 'RELATIVE') {
                targetTime = this.parseRelativeTime(clearAt);
            } else if (timeFormat === 'HH:MM') {
                let [hours, minutes] = clearAt.split(':').map(Number);
                targetTime = now.hour(hours).minute(minutes).second(0);
    
                if (targetTime.isBefore(now)) {
                    targetTime = targetTime.add(1, 'day');
                }
            } else {
                targetTime = spacetime(clearAt);
                // If target time has passed, throw error for ISO8601
                if (targetTime.isBefore(now)) {
                    throw new Error('ISO8601 timestamp is in the past');
                }
            }
    
            // If target time has passed today, move to next occurrence
            const timeToWait = targetTime.epoch - now.epoch;
            const displayTime = this.getFormattedTimeDisplay(targetTime, timeFormat, clearAt);
    
            console.log(`${this.name} Reset scheduled for ${displayTime} (in ${timeToWait}ms)`);

    
            if (this.resetTimers[uniqueID]?.timer) {
                clearTimeout(this.resetTimers[uniqueID].timer);
            }
    
            // Set new timer
            this.resetTimers[uniqueID] = {
                timer: setTimeout(() => {
                    console.log(`${this.name} Reset message time reached for ${uniqueID}`);
                    const resetMessage = {
                        uniqueID: uniqueID,
                        message: {
                            newMessageBody: "/clear",
                            newMessageHeader: messageHeader,
                            //clearAt: clearAt
                        }
                    };
                    this.writeJsonHistory(resetMessage);
                    this.sendSocketNotification('MMM-CUSTOM_MESSAGE_RESET_NOW', {uniqueID: uniqueID});

                    // // For relative times, don't schedule next reset
                    // // For HH:MM, schedule next reset
                    // if (timeFormat === 'HH:MM') {
                    //     this.manageMessage(newData);
                    // }
                }, timeToWait)
            };
    
        } catch (error) {
            console.error(`${this.name} Error in reset function: ${error.message}\nStack Trace:\n${error.stack}`);
            this.sendSocketNotification('MMM-CUSTOM_MESSAGE_ERROR', {
                uniqueID: uniqueID,
                error: error.message
            });
        }
    },
    
    // Function to handle API requests
    handleApiRequest () {
        // Use bodyParser middleware to parse JSON bodies
        this.expressApp.use(bodyParser.text());
        this.expressApp.use(bodyParser.json());
        
        // Define a POST route at '/mmm-custom-message'
        this.expressApp.post('/mmm-custom-message', (req, res) => {
            // Log the incoming webhook notification
            const contentType = req.headers['content-type'];
        
            if (contentType === 'application/json') {
                // Handle JSON data
                try {
                    const jsonData = req.body;
                    console.log('Incoming JSON webhook notification:', jsonData);
                    if (req.body.uniqueID) {
                        // Construct the new data object
                        const newData = {
                            uniqueID: req.body.uniqueID,
                            message: {
                                newMessageBody: req.body.message?.newMessageBody,
                                newMessageHeader: req.body.message?.newMessageHeader,
                                clearAt: req.body.message?.clearAt,
                            },
                        };
                        // Log the new data object
                        console.log('Processed data:', newData);
                        res.send({ status: 'success' });
                    } else {
                        // If no request body was provided, send a failed status with an error message
                        res.status(400).send({ status: 'failed', error: 'No payload given or received notification without uniqueID.' });
                    }
                } catch (error) {
                    console.error(`Error processing webhook notification: ${error.message}\nStack Trace:\n${error.stack}`);
                    res.status(500).send({ status: 'failed', error: 'An error occurred while processing the webhook notification. Most likely a json parsing error. Are you sending the correct format?' });
                }
            } else if (contentType === 'text/plain') {
                // Handle plain text data
                const text = req.body;
                // Regular expressions to match the desired keys and their values
                console.log('Incoming text webhook notification:', text);
        
                const uniqueIDRegex = /uniqueID:\s*(.*?)<\/p>/;
                const headerRegex = /newMessageHeader:\s*(.*?)<\/p>/;
                const bodyRegex = /newMessageBody:\s*(.*?)<\/p>/;
                const clearAtRegex = /clearAt:\s*(.*?)<\/p>/;
        
                // Extracting the values using the regular expressions
                const uniqueIDMatch = text.match(uniqueIDRegex);
                const headerMatch = text.match(headerRegex);
                const bodyMatch = text.match(bodyRegex);
                const clearAtMatch = text.match(clearAtRegex);
        
                // Assigning the extracted values to variables, or setting them to null if not found
                const uniqueID = uniqueIDMatch ? uniqueIDMatch[1] : null;
                const newMessageHeader = headerMatch ? headerMatch[1] : null;
                const newMessageBody = bodyMatch ? bodyMatch[1] : null;
                const clearAt = clearAtMatch ? clearAtMatch[1] : null;
        
                console.log('uniqueID:', uniqueID);
                console.log('newMessageHeader:', newMessageHeader);
                console.log('newMessageBody:', newMessageBody);
                console.log('clearAt:', clearAt);
        
                if (!uniqueID || !newMessageHeader || !newMessageBody, !clearAt)
                {
                // If any of the required keys were not found, send a failed status with an error message
                    res.status(400).send({ status: "failed", error: "Missing one or all of the required fields in webhook notification. This may be due to a text parsing or json parsing error. Are you sending the right format? You might want to try using json instead." });
                    return;
                }
                // Construct the new data object
                const newData = {
                    uniqueID: uniqueID,
                    message: {
                        newMessageBody: newMessageBody,
                        newMessageHeader: newMessageHeader,
                        clearAt: clearAt,
                    },
                };
                // Log the new data object
                console.log('Processed data:', newData);
                //console.log(`newData from webhook receiver about to be sent to writeJasonHistory:\n${JSON.stringify(newData, null, 2)}`);
                // Write the request body to the history file
                this.writeJsonHistory(newData);
                // Reset messages
                this.manageMessage(newData);
                res.send({status: "success"});
            } else {
                // Unsupported Content-Type
                res.status(415).send('Unsupported Media Type');
            }
        });
        
        // Handle errors in JSON payloads
        this.expressApp.use((err, req, res, next) => {
            if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
                console.error(`Invalid JSON payload: ${err.message} are you sure you're meaning to use JSON payload type?`);
                res.status(400).send({ status: 'failed', error: 'Invalid JSON payload.' });
            } else {
                next(err); // Pass the error to the default error handler
            }
        });
    },

    // Function to handle socket notifications
    socketNotificationReceived(notification, payload) {
        // const ConfigToSend = {
        //     uniqueID: this.config.uniqueID,
        //     enableHistory: this.config.enableHistory,
        //     initialHeaderMessage: this.config.initialHeaderMessage,
        //     initialBodyMessage: this.config.initialBodyMessage,
        //     enableMessageExpiration: this.config.enableMessageExpiration,
        // }
        
        // this.sendSocketNotification('MMM-CUSTOM_MESSAGE_CONFIG', ConfigToSend);
        if (notification === "MMM-CUSTOM_MESSAGE_CONFIG") {
            if (!payload.uniqueID){
                console.error(`${this.name} Received notification without uniqueID. All configurations must include a uniqueID:`, notification, payload);
                return;
            }
            // Log the reset message
            //console.log(`${this.name} Config Message:\n${JSON.stringify(payload, null, 2)}`);
            // Update the reset configuration with the payload
            this.writeJsonHistory(payload);
            // Reset messages
            this.manageMessage(payload);
        }
    }
});