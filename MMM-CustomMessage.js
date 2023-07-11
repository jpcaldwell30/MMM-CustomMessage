/* Magic Mirror
 * Module: MMM-CustomMessage
 *
 * By jpcaldwell30
 * MIT Licensed.
 */
Module.register("MMM-CustomMessage", {

    defaults: {
        myHeader: "",
            maxWidth: "100%",
            updateInterval: 30 * 60 * 1000,     // updates display
        },

    start: function() {
        var self = this;
    },

    // Gets correct css file from config.js
    getStyles: function() {
        return ["modules/MMM-CustomMessage/css/MMM-CustomMessage.css"]; // default.css
    },

      // Override dom generator.
    getDom: function() {
      var wrapper = document.createElement("div");

    if (this.config.myHeader != ""){
      var customHeader = document.createElement("div");
      customHeader.classList.add("medium", "bright", "customHeader");
      customHeader.innerHTML = this.config.myHeader;
      wrapper.appendChild(customHeader);
    }

    var moduleBody = document.createElement("div");
    moduleBody.classList.add("medium", "bright", "text");
    // Read the saved file and insert text here    (directly below this text) if possible !!!!!
    moduleBody.innerHTML = `<div contenteditable="true"></div>`;
    wrapper.appendChild(moduleBody);

       return wrapper;
    },

    notificationReceived: function(notification, payload) {
        if (notification === 'HIDE_TODO') {
            this.hide(500);
        }  else if (notification === 'SHOW_TODO') {
            this.show(1000);
        }

    },
});
