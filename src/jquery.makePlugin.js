/**
 * File: jquery.makePlugin.js
 *
 * Description:
 *     A jQuery function that generates a jQuery plugin, given a plugin definition.
 *
 * Author:
 *     Matt Burton (<matthew.a.burton@gmail.com>)
 */

(function ($) {

    // Specifies whether to print debug messages to the JavaScript console or not
    var DEBUG_MODE = false;


    // ------------------------------------------------------------
    // P U B L I C    M E M B E R S
    // ------------------------------------------------------------

    /**
     * Structure: PluginDefinition
     *
     * Provides properties for defining a plugin's identity, content, and behavior.
     *
     * Properties:
     *     pluginName - {String} The name of the plugin.
     *     defaults - {Object.<String, ?)>} An object containing the plugin's default configuration values
     *     init - {Function(this:Plugin)} The plugin's initialization method; this method is executed
     *            in the context of the <Plugin> instance.
     *     api - {Object.<String, Function(this:Plugin)>} An object containing public API methods API
     *           methods are executed in the context of the <Plugin> instance.
     *     helpers - {Object.<String, Function(this:Plugin)>|Object.<String, ?)>} An object containing
     *               private "helper" methods and properties. Helper methods are executed in the context
     *               of the <Plugin> instance.
     *     eventHandlers - {Array.<EventHandlerDefinition>} An array of event handlers to be registered by
     *                     the plugin. Event handlers are executed in the context of the <Plugin> instance.
     */

    /**
     * Structure: EventHandlerDefinition
     *
     * Provides properties for defining an event handler's target and behavior.
     *
     * Properties:
     *     target - {Object|Function():Object} The object to which the event handler will be attached.
     *     eventName - {String|Function():String} The name of the event to listen for.
     *     selector - {String|Function():String} The selector to use when defining the scope for an event handler.
     *     handler - {Function(this:Plugin, EventObject)} The event handler function. Event handlers are executed
     *               in the context of the <Plugin> instance.
     *
     * Remarks:
     *     To access the element which triggered the event, define the handler function like so...
     *
     *     : function (e) {
     *     :     var element = e.target;
     *     :     // Event handler code...
     *     : }
     *
     * See Also:
     *     http://api.jquery.com/category/events/event-object/
     */

    /**
     * Class: Plugin
     *
     * Represents a jQuery plugin and the element(s) it encapsulates.
     */
    function Plugin(pluginDef, element, config) {

        /**
         * Constructor: Plugin
         *
         * Constructs a new instance of a Plugin.
         *
         * Parameters:
         *     pluginDef - {<PluginDefinition>} The plugin definition.
         *     element - {HTMLElement} The HTML element(s) to be wrapped by the plugin.
         *     config - {Object} An object containing configuration settings for the plugin. (optional)
         */

        // Retain 'this' for closures
        var self = this;

        /**
         * Property: pluginName
         *
         * The name of the plugin.
         */
        this.pluginName; // Set in init routine

        /**
         * Property: element
         *
         * The element(s) that is/are wrapped by the plugin.
         */
        this.element = element;

        /**
         * Property: config
         *
         * The plugin configuration. A deep merge is made of the caller's config
         * values into the plugin's default values.
         */
        this.config = $.extend(true, $.extend({ }, pluginDef.defaults), config);

        /**
         * Property: api
         *
         * The plugin's API (public) methods. API methods are accessed internally
         * (by the plugin author) by calling
         *     : this.api.myMethod(args...)
         * ... and externally (by the plugin user) by calling
         *     : $("#selector").myPlugin("myMethod", args...)
         *
         * API methods are executed in the context of the <Plugin> instance.
         */
        this.api = { }; // Set in init routine

        /**
         * Property: helpers
         *
         * The plugin's "helper" (private) methods and properties.  Helper
         * methods are executed in the context of the <Plugin> instance.
         */
        this.helpers = { }; // Set in init routine

        /**
         * Property: eventHandlers
         *
         * The list of <EventHandlerDefinition> objects that are registered during the
         * plugin initialization. Event handlers are executed in the context of the
         * <Plugin> instance.
         */
        this.eventHandlers = pluginDef.eventHandlers || [ ];

        /**
         * Method: destroy
         *
         * Unbinds all event handlers that were registered during plugin initialization.
         *
         * Parameters:
         *     fullDestroy - {Boolean} Specifies whether to delete the wrapped element(s) or
         *                   simply unbind event handlers. (optional; default: false)
         */
        this.destroy = function (fullDestroy) {
            debug("Plugin.destroy");

            // Unbind event handlers
            $.each(self.eventHandlers, function (index, handlerDef) {
                self.unbind(handlerDef);
            });

            if (fullDestroy) {
                $(self.element).remove();
            }
        };

        /**
         * Method: bind
         *
         * Binds an event handler to an element, given the handler definition.
         *
         * Parameters:
         *     handlerDef - {<EventHandlerDefinition>} The handler definition.
         *     handlerDef.eventName - {String|Function(this:Plugin):string} The name of the event to listen for.
         *     handlerDef.handler - {Function(this:Plugin, EventObject)} The event handler function. Executed
         *                          in the context of the <Plugin> instance.
         *     handlerDef.target - {Object|Function(this:Plugin):Object} The object to which the event handler
         *                         will be attached. (optional; default: <Plugin.element>)
         *     handlerDef.selector - {String|Function(this:Plugin):String} The selector to use when defining
         *                           the scope for the event handler. (optional)
         *
         * See Also:
         *     http://api.jquery.com/category/events/event-object/
         */
        this.bind = function (handlerDef) {
            debug("Plugin.bind: handlerDef", handlerDef);

            var eventName = getValue(handlerDef.eventName);
            if (!eventName) {
                $.error("handlerDef.eventName is required");
            }

            var fullEventName = (eventName + "." + self.pluginName);
            var target = getValue(handlerDef.target) || $(self.element);
            var selector = getValue(handlerDef.selector);
            var handler = handlerDef.handler || $.noop();
            $(target).on(fullEventName, selector, function () { handler.apply(self, arguments); });
        };

        /**
         * Method: unbind
         *
         * Unbinds an event handler, given the handler definition.
         *
         * Parameters:
         *     handlerDef - {<EventHandlerDefinition>} The handler definition.
         *     handlerDef.eventName - {String|Function(this:Plugin):String} The name of the event to stop
         *                            listening for.
         *     handlerDef.target - {Object|Function(this:Plugin):Object} The object to which the event handler
         *                         is attached. (optional; default: <Plugin.element>)
         *     handlerDef.selector - {String|Function(this:Plugin):String} The selector to use when defining
         *                           the scope for the event handler. (optional)
         */
        this.unbind = function (handlerDef) {
            debug("Plugin.unbind: handlerDef", handlerDef);

            var eventName = getValue(handlerDef.eventName);
            if (!eventName) {
                $.error("handlerDef.eventName is required");
            }

            var fullEventName = (eventName + "." + self.pluginName);
            var target = getValue(handlerDef.target) || $(self.element);
            var selector = getValue(handlerDef.selector);
            $(target).off(fullEventName, selector);
        };

        /**
         * Method: trigger
         *
         * Triggers an event handler, given the handler definition.
         *
         * Parameters:
         *     handlerDef - {<EventHandlerDefinition>} The handler definition.
         *     handlerDef.eventName - {String|Function(this:Plugin):String} The name of the event to trigger.
         *     handlerDef.target - {Object|Function(this:Plugin):Object} The object to which the event handler
         *                         is attached. (optional; default: <Plugin.element>)
         */
        this.trigger = function (handlerDef) {
            debug("Plugin.trigger: handlerDef", handlerDef);

            var eventName = getValue(handlerDef.eventName);
            if (!eventName) {
                $.error("handlerDef.eventName is required");
            }

            var fullEventName = (eventName + "." + self.pluginName);
            var target = getValue(handlerDef.target) || $(self.element);
            $(target).trigger(fullEventName);
        };

        // Plugin initialization
        (function init() {
            debug("Plugin.init");

            // Plugin name is required
            if ($.type(pluginDef.pluginName) !== "string") {
                $.error("Argument 'pluginDef.pluginName' must be a string");
            } else {
                self.pluginName = pluginDef.pluginName;
            }

            // Wrap each API method in a proxy function
            $.each(pluginDef.api, function (apiMethodName, apiMethod) {
                if ($.type(apiMethod) === "function") {
                    self.api[apiMethodName] = function () { return apiMethod.apply(self, arguments); };
                }
            });

            // Wrap each helper method in a proxy function; leave helper properties unchanged
            $.each(pluginDef.helpers, function (helperName, helper) {
                if ($.type(helper) === "function") {
                    self.helpers[helperName] = function () { return helper.apply(self, arguments); };
                } else {
                    self.helpers[helperName] = helper;
                }
            });

            // Bind event handlers
            $.each(self.eventHandlers, function (index, handlerDef) {
                self.bind(handlerDef);
            });

            // Run the 'init' method from the plugin definition (if it exists)
            if ($.type(pluginDef.init) === "function") {
                pluginDef.init.apply(self);
            }

        })(); // End: Plugin initialization

        // Returns: val -> (null || undefined): null
        //          val -> function: val(this:Plugin)
        //          val -> ?: val
        function getValue(val) {
            switch ($.type(val)) {
                case "null":
                case "undefined":
                    return null;
                case "function":
                    return val.apply(self);
                default:
                    return val;
            }
        }

    } // End: Plugin(element)


    // ------------------------------------------------------------
    // P R I V A T E    M E M B E R S
    // ------------------------------------------------------------

    // Prints all arguments to the JavaScript console
    function debug() {
        if (DEBUG_MODE && console && console.info) {
            console.info.apply(console, arguments);
        }
    }


    // Gets the current Plugin for the target element, if it exists; otherwise,
    // constructs a new Plugin instance
    function getPlugin(pluginDef, element, options_) {
        var plugin = $(element).data(pluginDef.pluginName);
        if (!plugin) {
            plugin = new Plugin(pluginDef, element, options_);
            $(element).data(pluginDef.pluginName, plugin);
        }

        return plugin;
    }


    // Creates a jQuery plugin given a plugin definition
    function makePlugin(pluginDef) {
        debug("makePlugin: pluginDef", pluginDef);

        // The plugin name is required
        if (!pluginDef.pluginName) {
            $.error("Invalid plugin name (argument: pluginDef.pluginName)");
        }

        // Export the plugin function to the jQuery 'fn' namespace
        $.fn[pluginDef.pluginName] = function (arg) {
            // 'this' is the target element(s)
            var element = this;

            // If the caller passed the name of an API method as the first argument, call
            // the API method, forwarding any additional arguments passed by the caller.
            // If no method name was passed, or if the first argument is a config object,
            // initialize a new instance of the plugin.
            var api = pluginDef.api || { };
            if (api[arg]) {
                var plugin = getPlugin(pluginDef, element);
                return plugin.api[arg].apply(plugin, Array.prototype.slice.call(arguments, 1));
            } else if (typeof arg === "object" || !arg) {
                var options = (arguments.length > 0) ? arguments[0] : { };
                return getPlugin(pluginDef, element, options).element;
            } else {
                // Throw an error if an invalid/nonexistent API method was called
                $.error("Method [" + arg + "] does not exist for jQuery." + pluginDef.pluginName);
            }
        }; // End: $.fn[pluginDef.pluginName] ...
    }; // End: makePlugin(pluginDef)

    // Attach the 'makePlugin' function to the jQuery object
    $.extend({ "makePlugin": makePlugin });

})(jQuery);
