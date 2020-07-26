// #import UIKit
'use strict';

JSClass("Theme", JSObject, {

    init: function(){

    },

    toolbarStyler: JSLazyInitProperty('createToolbarStyler'),

    createToolbarStyler: function(){
        var styler = UIToolbarCustomStyler.initWithItemColor(JSColor.initWithWhite(0.2));
        styler.itemSpacing = 7;
        return styler;
    },

    toolbarButtonStyler: JSLazyInitProperty('createToolbarButtonStyler'),

    createToolbarButtonStyler: function(){
        var styler = UIButtonDefaultStyler.init();
        styler.borderWidth = 0.5;
        styler.shadowColor = null;
        styler.titleInsets = JSInsets(4, 10);
        return styler;
    },

});

Object.defineProperties(Theme, {
    default: {
        configurable: true,
        get: function Theme_getDefault(){
            var theme = Theme.init();
            Object.defineProperty(Theme, "default", {value: theme});
            return theme;
        }
    }
});