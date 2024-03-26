/* MagicMirror²
 * Module: MMM-CustomMessage
 *
 * By jpcaldwell30
 * MIT Licensed.
 */
// Import required modules
const NodeHelper = require('node_helper');
const bodyParser = require('body-parser');
const fs = require('fs');

// Export the module
module.exports = NodeHelper.create({
    // Function called when the module starts
    start: function () {
        this.resetConfig = {}; // Initialize reset configuration
        console.log(this.name + ' helper started'); // Log that the helper has started
        this.handleApiRequest(); // Handle API requests   
    },

    // Function to write to the history file
    writeHistoryFile: function (text) {
        const fileName = "modules/MMM-CustomMessage/message-history.json"; // Define the file name
        fs.writeFile(fileName, text, (err) => { // Write to the file
            console.log(this.name + " Writing to file", text); // Log the writing process
            if (err) { // If there's an error
                console.log(this.name + "Error writing to history file:", err); // Log the error
            } else {
                res.send("Config file written successfully."); // Send a success message
            }
        });     
    },

    // Function to reset the module
    reset: function () {
        if (this.resetConfig["enabled"] == "true") { // If reset is enabled
            const now = new Date(Date.now()); // Get the current date and time
            const targetTime = new Date(now); // Set the target time to now
            const time = this.resetConfig["time"].split(":"); // Split the reset time into hours and minutes
            const targetHour =  Number(time[0]) // Get the target hour
            const targetMinute = Number(time[1]) // Get the target minute
            console.log(this.name + 'Reset set for Hour: ', targetHour, ', Min: ', targetMinute); // Log the reset time
            targetTime.setHours(targetHour, targetMinute, 0, 0); // Set the target time
        
            let timeToWait = targetTime - now; // Calculate how long to wait before resetting
        
            if (timeToWait < 0) { // If the target time has already passed today
                targetTime.setDate(targetTime.getDate() + 1); // Move to the next day
                timeToWait = targetTime - now; // Recalculate how long to wait
                console.log(this.name + ' Target time already passed, moving to next day'); // Log that the target time has passed and we're moving to the next day
            }
            console.log(this.name + ' TimeToWait: ', timeToWait); // Log how long we're waiting

            setTimeout(() => { // Wait for the specified amount of time, then...
                console.log(this.name + ' Reset message time is now. Retting message...'); 
                this.writeHistoryFile(""); //clear history file
                this.sendSocketNotification('RESET_NOW'); //send reset notification
            }, timeToWait);
        }   else {
            console.log(this.name + ' Reset not enabled'); 
        }  
    },
    // Function to handle API requests
    handleApiRequest: function () {
        // Use bodyParser middleware to parse JSON bodies
        this.expressApp.use(bodyParser.json()); 

        // Use bodyParser middleware to parse URL-encoded bodies
        this.expressApp.use(bodyParser.urlencoded({ extended: true })); 

        // Define a POST route at '/custom-message'
        this.expressApp.post('/custom-message', (req, res) => {
            // Convert the request body to a JSON string
            let stringBody = JSON.stringify(req.body)

            // Log the incoming webhook notification
            console.log('Incoming webhook notification : ' + stringBody);

            // If the request body exists
            if (req.body){
                // Send a socket notification with the request body
                this.sendSocketNotification('NEW_MESSAGE_RECEIVED', req.body);

                // Write the request body to the history file
                this.writeHistoryFile(stringBody)

                // Reset messages
                this.reset();

                // Send a success status
                res.send({"status": "success"});
            } else {
                // If no request body was provided, send a failed status with an error message
                res.send({"status": "failed", "error": "No payload given."});
            }
        });
    },

    // Function to handle socket notifications
    socketNotificationReceived(notification, payload) {
        // If the notification is 'RESET_MESSAGE_CONFIG'
        if (notification === 'RESET_MESSAGE_CONFIG') {
            // Log the reset message
            console.log(this.name + ' Reset Message: ', JSON.stringify(payload));

            // Update the reset configuration with the payload
            this.resetConfig = payload;

            // Reset messages
            this.reset();        
        }
    }
});
