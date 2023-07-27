const NodeHelper = require('node_helper');
const bodyParser = require('body-parser');
const axios = require('axios').default;
const _ = require('lodash');

module.exports = NodeHelper.create({
    start: function () {
        console.log(this.name + ' helper started');
        this.handleApiRequest();
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === 'START') {
            this.customConfig = payload;
        }
    },

    handleApiRequest: function () {
        this.expressApp.use(bodyParser.json()); // support json encoded bodies
        this.expressApp.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
        this.expressApp.post('/custom-message', (req, res) => {
            console.log('Incoming webhook notification : ' + JSON.stringify(req.body));
            if (req.body.message){
                    this.sendSocketNotification('NEW_MESSAGE_RECEIVED', req.body);
                    res.send({"status": "success"});
                }else{
                    res.send({"status": "failed", "error": "No payload given."});
                }
        });
    },
});
