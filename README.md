#### *"Yo dawg, I heard you like jQuery plugins..."* ####


### About ###

`jquery.makePlugin.js` is a jQuery function that builds jQuery plugins. It eliminates
the need for all of the boilerplate code required to build a solid jQuery plugin, and
instead lets you focus on developing your plugin's functionality.

`jquery.makePlugin.js` gives your plugin support for managing event handlers (bind, unbind,
trigger), plugin destruction (automatic unbinding of event handlers, per the
[recommendation](http://docs.jquery.com/Plugins/Authoring#Events)), and public API methods,
all automatically.


### Usage ###

```javascript
$.makePlugin({
    "pluginName": "PLUGIN_NAME",

    "defaults": {
        // Default values...
    },

    "init": function () {
        // Plugin initialization code...
    },

    "api": {
        // Public API methods...
    },

    "helpers": {
        // Private helper methods/properties...
    },

    "eventHandlers": [
        // Event handlers...
    ]
});
```

##### Breakdown #####

-----

```javascript
$.makePlugin({ ...
```

Creates a new jQuery plugin by calling the `makePlugin` function defined in
`jquery.makePlugin.js`.

-----

```javascript
"pluginName": "PLUGIN_NAME", ...
```

Specifies the name of the plugin, and, *ipso facto*, the name of the function
used to construct the plugin, *eg.*, `"myPlugin" -> $("#foo").myPlugin()`.

-----

```javascript
"defaults": {
    // Default values...
}, ...
```

An object specifying default values for the plugin. These values can be overridden
when the plugin is constructed. Prior to the `init` method being run, the caller's
overriding values are merged with the plugin defaults; the resulting object is available
to all plugin methods (public and private) via `this.config`.

-----

```javascript
"init": function () {
    // Plugin initialization code...
}, ...
```

The plugin's initialization method. This method is run after the default plugin initialization
so that plugin authors can use API and helper methods/properties during init. The `this` context
for `init` is the plugin instance. This method is not callable from other plugin methods.

-----

```javascript
"api": {
    // Public API methods...
},  ...
```

The plugin's publicly-visible (API) methods. Methods defined here are available internally
via `this.api.<method>`, and externally via `$("#foo").pluginName("method", arg1, argN...)`.
The `this` context for all API methods is the plugin instance.

-----

```javascript
"helpers": {
    // Private helper methods/properties...
}, ...
```

The plugin's internally-visible (private) methods and properties. Members defined here are
available internally via `this.helpers.<method|property>`. The `this` context for all helper
methods is the plugin instance.

-----

```javascript
"eventHandlers": [
    // Event handlers...
] ...
```

An array of event handler objects that will be attached during initialization. Event handlers
can be attached to plugin elements, or to external elements (such as `window`, or another DOM
element). Alternatively, event handlers can be registered by calling `this.bind()`, and
unregistered with `this.unbind()`. Event handlers registered in this way (either as part of the
plugin definition, or by calling `this.bind()`) can be manually triggered by calling
`this.trigger({ "eventName": "click" })`.

**Example:**

```javascript
// Attach a handler to the plugin element's "click" event
{
    "eventName": "click",
    "handler": function (e) {
        // Change the element's background color
        var el = this.element;
        $(el).css("backgroundColor", "#cfa");
        alert("You clicked me!");
    }
},

// Attach a handler to the window object's "resize" event
{
    "target": window,
    "eventName": "resize",
    "handler": function (e) {
        console.info("The window is resizing!");
    }
}
```
