## MMM-CustomMessage

ToDo list, reminders, leaves messages, insults, etc., with a unique twist.

You can update the mirror display in real time (Live), as it's running, without quitting or reloading MM.

* You can use multiple instances by simply adding another config entry.

* Each instance can have its own heading. Headers are self-centering.

* Works well in all regions. Make it as wide or as tall as you like it.

* Caveat: Multiple instances can not use different css files (unless I can figure that out).

## Requirements and recommendations

You will need a keyboard for text entry and a mouse to click the module into edit mode.

A bluetooth/wireless keyboard for text entry. (Wired will work but that's not as cool)

## Installation

* `git clone https://github.com/mykle1/MMM-ToDoLive` into the `~/MagicMirror/modules` directory.

## Config.js entry and options
```
{
    disabled: false,
    module: "MMM-CustomMessage",
    position: "middle_center",
    config: {
        myHeader: "Things to do!",
    }
},
{
    disabled: false,
    module: "MMM-CustomMessage",
    position: "top_right",
    config: {
        myHeader: "Shopping List",
    }
},
```
## How to use it!

* Click the default text to enter edit mode.
* Delete default text and create your items.
* "Enter" creates a new line.
* When you are done, click anywhere outside the text area of the module.
* When you want to edit again, click the text of the module to enter edit mode.
* Simply make multiple entries in your config for multiple instances
