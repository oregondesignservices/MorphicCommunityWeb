// #import Foundation
'use strict';

JSClass("Bar", JSObject, {

    init: function(){
        this.items = [];
    },

    initWithDictionary: function(dictionary){
        this.id = dictionary.id;
        this.name = dictionary.name;
        this.shared = dictionary.is_shared;
        this.items = dictionary.items || [];
    },

    id: null,
    name: null,
    shared: false,
    items: null,

    dictionaryRepresentation: function(){
        return {
            id: this.id,
            name: this.name,
            is_shared: this.shared,
            items: this.items
        };
    },

});

Bar.nameComparison = function(a, b){
    return a.name.localeCompare(b.name);
};