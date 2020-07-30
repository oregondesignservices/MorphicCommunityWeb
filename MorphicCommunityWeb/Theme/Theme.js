// #import UIKit
// #import "BarItemDetailViewTextFieldStyler.js"
'use strict';

JSClass("Theme", JSObject, {

    init: function(){
    },

    itemDetailTextFieldStyler: JSLazyInitProperty('createItemDetailTextFieldStyler'),

    createItemDetailTextFieldStyler: function(){
        var styler = BarItemDetailViewTextFieldStyler.init();
        return styler;
    }

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