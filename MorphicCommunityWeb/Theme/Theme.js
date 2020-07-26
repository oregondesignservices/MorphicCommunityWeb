// #import UIKit
'use strict';

JSClass("Theme", JSObject, {

    init: function(){
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