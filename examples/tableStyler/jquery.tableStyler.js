$.makePlugin({
    "pluginName": "tableStyler",

    "defaults": {
        "style": {
            "backgroundColor": "#faa",
            "borderColor": "#000000",
            "borderStyle": "solid",
            "borderWidth": "1px",
            "borderCollapse": "collapse",
            "fontFamily": "Arial"
        }
    },

    "init": function () {
        console.info("this.element");

        this.helpers.applyStyle(this.config.style);
    },

    "api": {
        "boldify": function () {
            this.helpers.makeTextBold();
        },

        "setFontName": function (fontName) {
            this.helpers.setFontName(fontName);
        },

        "unbindEventHandlers": function () {
            this.destroy();
        },

        "simulateTableClick": function () {
            this.helpers.simulateTableClick();
        },

        "destroyPlugin": function () {
            this.destroy(/*fullDestroy*/true);
        }
    },

    "helpers": {
        "applyStyle": function (style) {
            var $el = $(this.element);
            $.each(style, function (styleName, styleValue) {
                $el.css(styleName, styleValue);
            });

            // Border styles must be applied to the table, th, and td elements
            this.helpers.setBorder(style);
        },

        "makeTextBold": function () {
            $(this.element).css("fontWeight", "bold");
        },

        "setBorder": function (style) {
            var elements = $(this.element).parent().find("table, th, td");

            if (style.borderColor) {
                elements.css("borderColor", style.borderColor);
            }

            if (style.borderStyle) {
                elements.css("borderStyle", style.borderStyle);
            }

            if (style.borderWidth) {
                elements.css("borderWidth", style.borderWidth);
            }
        },

        "setFontName": function (fontName) {
            $(this.element).css("fontFamily", fontName);
        },

        "simulateTableClick": function () {
            this.trigger({ eventName: "click" });
        }
    },

    "eventHandlers": [
        {
            "eventName": "click",
            "handler": function (e) {
                console.info("Changing table background color!");
                $(this.element).css("backgroundColor", "#cfa");

                console.info("You clicked me!");
                alert("You clicked me!");
            }
        },
        {
            "target": window,
            "eventName": "resize",
            "handler": function (e) {
                console.info("The window is resizing!");
            }
        }
    ]
});
