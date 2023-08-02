const NodeHelper = require('node_helper');
const bodyParser = require('body-parser');
const fs = require('fs');

module.exports = NodeHelper.create({
    start: function () {
        this.resetConfig = {};
        console.log(this.name + ' helper started');
        this.handleApiRequest();    
    },

    writeHistoryFile: function (text) {
        const fileName = "modules/MMM-CustomMessage/message-history.json";
        fs.writeFile(fileName, text, (err) => {
            console.log(this.name + " Writing to file", text);
            if (err) {
                console.log(this.name + "Error writing to history file:", err);
            } else {
                res.send("Config file written successfully.");
            }
        });     
    },

    reset: function () {
        if (this.resetConfig["enabled"] == "true") {
            const now = new Date();
            const targetTime = new Date(now);
            const time = this.resetConfig["time"].split(":");
            const targetHour =  Number(time[0])
            const targetMinute = Number(time[1])
            console.log(this.name + 'Reset set for Hour: ', targetHour, ', Min: ', targetMinute);
            targetTime.setHours(targetHour, targetMinute, 0, 0);
        
            let timeToWait = targetTime - now;
            //let timeToWaitInterval = 24 * 60 * 60 * 1000; 
        
            if (timeToWait < 0) {
            // If the target hour has already passed today, move to the next day
            targetTime.setDate(targetTime.getDate() + 1);
            timeToWait = targetTime - now;
            console.log(this.name + ' Target time already passed, moving to next day');
            }
            console.log(this.name + ' TimeToWait: ', timeToWait);

            setTimeout(() => {
                console.log(this.name + ' Reset message time is now. Retting message...');
                this.writeHistoryFile("");
                this.sendSocketNotification('RESET_NOW');
            // If you want to perform the action repeatedly every 24 hours, you can use setInterval instead.
            //setInterval(() => action(), 24 * 60 * 60 * 1000);
            }, timeToWait);

            // setInterval(() => {
            //     this.sendSocketNotification('NEW_MESSAGE_RECEIVED', req.body);
            // }, timeToWaitInterval);
        }   else {
            console.log(this.name + ' Reset not enabled');
        }  
    },

    handleApiRequest: function () {
        this.expressApp.use(bodyParser.json()); // support json encoded bodies
        this.expressApp.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
        this.expressApp.post('/custom-message', (req, res) => {
            let stringBody = JSON.stringify(req.body)
            console.log('Incoming webhook notification : ' + stringBody);
            if (req.body){
                    this.sendSocketNotification('NEW_MESSAGE_RECEIVED', req.body);
                    this.writeHistoryFile(stringBody)
                    this.reset();
                    res.send({"status": "success"});
                }else{
                    res.send({"status": "failed", "error": "No payload given."});
                }
        });
    },

    socketNotificationReceived(notification, payload) {
        if (notification === 'RESET_MESSAGE_CONFIG') {
            console.log(this.name + ' Reset Message: ', JSON.stringify(payload));
            this.resetConfig = payload;
            this.reset();        
        }
    }
});
const NodeHelper = require('node_helper');
const bodyParser = require('body-parser');
const fs = require('fs');

module.exports = NodeHelper.create({
    start: function () {
        this.resetConfig = {};
        console.log(this.name + ' helper started');
        this.handleApiRequest();    
    },

    writeHistoryFile: function (text) {
        const fileName = "modules/MMM-CustomMessage/message-history.json";
        fs.writeFile(fileName, text, (err) => {
            console.log(this.name + " Writing to file", text);
            if (err) {
                console.log(this.name + "Error writing to history file:", err);
            } else {
                res.send("Config file written successfully.");
            }
        });     
    },

    reset: function () {
        if (this.resetConfig["enabled"] == "true") {
            const now = new Date();
            const targetTime = new Date(now);
            const time = this.resetConfig["time"].split(":");
            const targetHour =  Number(time[0])
            const targetMinute = Number(time[1])
            console.log(this.name + 'Reset set for Hour: ', targetHour, ', Min: ', targetMinute);
            targetTime.setHours(targetHour, targetMinute, 0, 0);
        
            let timeToWait = targetTime - now;
            //let timeToWaitInterval = 24 * 60 * 60 * 1000; 
        
            if (timeToWait < 0) {
            // If the target hour has already passed today, move to the next day
            targetTime.setDate(targetTime.getDate() + 1);
            timeToWait = targetTime - now;
            console.log(this.name + ' Target time already passed, moving to next day');
            }
            console.log(this.name + ' TimeToWait: ', timeToWait);

            setTimeout(() => {
                console.log(this.name + ' Reset message time is now. Retting message...');
                this.writeHistoryFile("");
                this.sendSocketNotification('RESET_NOW');
            // If you want to perform the action repeatedly every 24 hours, you can use setInterval instead.
            //setInterval(() => action(), 24 * 60 * 60 * 1000);
            }, timeToWait);

            // setInterval(() => {
            //     this.sendSocketNotification('NEW_MESSAGE_RECEIVED', req.body);
            // }, timeToWaitInterval);
        }   else {
            console.log(this.name + ' Reset not enabled');
        }  
    },

    handleApiRequest: function () {
        this.expressApp.use(bodyParser.json()); // support json encoded bodies
        this.expressApp.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
        this.expressApp.post('/custom-message', (req, res) => {
            let stringBody = JSON.stringify(req.body)
            console.log('Incoming webhook notification : ' + stringBody);
            if (req.body){
                    this.sendSocketNotification('NEW_MESSAGE_RECEIVED', req.body);
                    this.writeHistoryFile(stringBody)
                    this.reset();
                    res.send({"status": "success"});
                }else{
                    res.send({"status": "failed", "error": "No payload given."});
                }
        });
    },

    socketNotificationReceived(notification, payload) {
        if (notification === 'RESET_MESSAGE_CONFIG') {
            console.log(this.name + ' Reset Message: ', JSON.stringify(payload));
            this.resetConfig = payload;
            this.reset();        
        }
    }
});
