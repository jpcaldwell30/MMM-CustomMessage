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
        text: {
			"value": ""
        },
        fontSize: {
            "value": ""
        },
		filePath: {
			"value": ""
		},
		fileContent: {
			"value": ""
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

      var getText = () => {
        var txt = this.config.text["value"];
        return txt;
    };

    var getFilePath = () => {
        var filePath = this.config.filePath["value"];
        return filePath;
    };

    var getFontSize = () => {
        var fontSize = this.config.fontSize["value"];
        return fontSize;
    };

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
    moduleBody.innerHTML = getText();
    moduleBody.style.fontFamily = getFont();
    moduleBody.style.fontSize = getFontSize();
    moduleBody.style.fontStyle = getFontStyle();
    moduleBody.style.color = getColor();
        
        //Read file content if path has been given
        if (getFilePath() !== "") {			
            var self = this;
            this.readFileContent(function (response) {
                self.config.fileContent["value"] = response.replace(/(?:\r\n|\r|\n)/g, '<br>');
                moduleBody.innerHTML = self.config.fileContent["value"];
            });
        }

        wrapper.appendChild(moduleBody);
        return wrapper;
    },

    refresh: function() {
        this.updateDom();
        setTimeout( () => {
            this.refresh();
        }, this.config.refreshMs["value"]);
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

    notificationReceived: function(notification, payload) {
        if (notification === 'HIDE_TODO') {
            this.hide(500);
        }  else if (notification === 'SHOW_TODO') {
            this.show(1000);
        }        
    
        if (notification == "DOM_OBJECTS_CREATED") {
            this.refresh();
        }

    },
});
