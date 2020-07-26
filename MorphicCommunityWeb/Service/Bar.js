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
        this.items = [];
        if (dictionary.items){
            for (var i = 0, l = dictionary.items.length; i < l; ++i){
                this.items.push(BarItem.initWithDictionary(dictionary.items[i]));
            }
        }
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
            items: this.items.map(function(i){ return i.dictionaryRepresentation(); })
        };
    },

});

Bar.nameComparison = function(a, b){
    return a.name.localeCompare(b.name);
};

JSClass("BarItem", JSObject, {

    initWithKind: function(kind){
        this.kind = kind;
    },

    initWithDictionary: function(dictionary){
        this.kind = dictionary.kind;
        this.label = dictionary.label;
        this.primary = dictionary.is_primary;
        if (dictionary.image_url){
            this.imageURL = JSURL.initWithString(dictionary.image_url);
        }
        this.configuration = JSDeepCopy(dictionary.configuration);
    },

    dictionaryRepresentation: function(){
        return {
            kind: this.kind,
            label: this.label,
            image_url: this.imageURL !== null ? this.imageURL.encodedString : null,
            configuration: JSDeepCopy(this.configuration)
        };
    },

    kind: null,
    label: null,
    imageURL: null,
    configuration: null,
    primary: null,

});

BarItem.Kind = {
    link: "link",
    application: "application",
    action: "action"
};