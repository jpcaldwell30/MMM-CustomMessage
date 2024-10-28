## MMM-CustomMessage

This module allows you to post a message to MagicMirror either by MagicMirror² API post or manual update (entering text onscreen). 

![Example Image](example1.png)

Features:

* You can update the mirror display in real time (Live), as it's running, without quitting or reloading MM.

* You can use multiple instances by simply adding another config entry.

* Each instance can have its own heading. Headers are self-centering.

* The module has an API allowing for messages to be set remotely with a POST request. For example, you could use the API combined with Microsoft Power Automate to set a message on the screen whenever a message is sent to a specific teams channel. 

* The module has a reset function that can allow for the message to be cleared automatically at a specified time daily.

* The module has a history option to allow the last sent message to survive browser reloads/systems restarts.

* You can specify custom CSS by editing the MMM-CustomMessage.css file in this module's CSS folder

## Requirements and recommendations

You will need a keyboard for text entry and a mouse to click the module into edit mode for manual updating.

## Installation

* `git clone https://github.com/jpcaldwell30/MMM-CustomMessage` into the `~/MagicMirror/modules` directory.

## Config.js entry and options
```js
{
    disabled: false,
    module: "MMM-CustomMessage",
    position: "middle_center",
    config: {
        initialHeaderText: "Simple Config",
    }
},
{
    disabled: false,
    module: "MMM-CustomMessage",
    position: "middle_center",
    config: {
        initialHeaderText: {
            "value":"Full config" // Initial header text value
        },
        initialText: {
            "value": "This config contains all available settings" // Initial text value
        },
        fontSize: {
            "value": "16" // Font size value. Raw value no units
        },
        headerFontSize: {
            "value": "30" // Header font size value. Raw value no units
        },
        enableHistory: {
            "value": "false" // Enable history. If set to true, the last message set via API will be saved to file.
                             // Currently does not save manually set messages 
        },
        resetMessage: {
            "enabled": "false", // Reset message enabled value
            "time": "00:00" // time in 24 hour format when you want to have the message reset on a daily basis.
        }     
    }
},
```
## How to use manual entry.

* Click the default text to enter edit mode.
* Delete the default text and create your items.
* "Enter" creates a new line.
* When you are done, click anywhere outside the text area of the module.
* When you want to edit again, click the text of the module to enter edit mode.

## How to use the API.
The API uses MagicMirror's ExpressApp backend. The default endpoint is `http:\\<your MagicMirror url or ip and port> + \custom-message` For example: `http:\\localhost:8080\custom-message` The endpoint accepts POST requests with a JSON body of the form:

{
  "messageHeader": "Message Header Message",
  "message": "Message Text"
}
