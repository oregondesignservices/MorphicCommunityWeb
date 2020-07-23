// #import UIKit
'use strict';

JSClass("Theme", JSObject, {

    

});

Object.defineProperties(Theme, {
    default: {
        configurable: true,
        value: function Theme_getDefault(){
            var theme = Theme.init();
            Object.defineProperty(Theme, "default", {value: theme});
            return theme;
        }
    }
});