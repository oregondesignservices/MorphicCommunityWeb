// #import Foundation
'use strict';

JSClass("BarItemLibrary", JSObject, {

    init: function(){
        var bundle = JSBundle.mainBundle;
        var metadata = bundle.metadataForResourceName("BarItemLibrary");
        this.items = JSDeepCopy(metadata.value.items);
        var item;
        for (var i = 0, l = this.items.length; i < l; ++i){
            item = this.items[i];
            item.title = bundle.localizedString(item.title.substr(1), "BarItemLibrary");
            item.description = bundle.localizedString(item.description.substr(1), "BarItemLibrary");
            if (item.configuration){
                if (item.configuration.label){
                    item.configuration.label = bundle.localizedString(item.configuration.label.substr(1), "BarItemLibrary");
                }
            }
        }
    },

    items: null,

});

Object.defineProperties(BarItemLibrary, {
    shared: {
        configurable: true,
        get: function BarItemLibrary_getShared(){
            var library = BarItemLibrary.init();
            Object.defineProperty(BarItemLibrary, 'shared', {value: library});
            return library;
        }
    }
});