// Copyright 2020 Raising the Floor - International
//
// Licensed under the New BSD license. You may not use this file except in
// compliance with this License.
//
// You may obtain a copy of the License at
// https://github.com/GPII/universal/blob/master/LICENSE.txt
//
// The R&D leading to these results received funding from the:
// * Rehabilitation Services Administration, US Dept. of Education under 
//   grant H421A150006 (APCP)
// * National Institute on Disability, Independent Living, and 
//   Rehabilitation Research (NIDILRR)
// * Administration for Independent Living & Dept. of Education under grants 
//   H133E080022 (RERC-IT) and H133E130028/90RE5003-01-00 (UIITA-RERC)
// * European Union's Seventh Framework Programme (FP7/2007-2013) grant 
//   agreement nos. 289016 (Cloud4all) and 610510 (Prosperity4All)
// * William and Flora Hewlett Foundation
// * Ontario Ministry of Research and Innovation
// * Canadian Foundation for Innovation
// * Adobe Foundation
// * Consumer Electronics Association Foundation

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
        this.primary = dictionary.is_primary || false;
        this.configuration = BarItemConfiguration.initWithKind(this.kind, dictionary.configuration || {});
    },

    dictionaryRepresentation: function(){
        return {
            kind: this.kind,
            is_primary: this.primary,
            configuration: this.configuration.dictionaryRepresentation()
        };
    },

    kind: null,
    primary: null,
    configuration: null,

});

JSClass("BarItemConfiguration", JSObject, {

    initWithKind: function(kind, dictionary){
        switch (kind){
            case BarItem.Kind.link:
                return BarItemLinkConfiguration.initWithDictionary(dictionary);
            case BarItem.Kind.application:
                return BarItemApplicationConfiguration.initWithDictionary(dictionary);
            case BarItem.Kind.action:
                return BarItemActionConfiguration.initWithDictionary(dictionary);
            default:
                return BarItemConfiguration.initWithDictionary(dictionary);
        }
    },

    dictionaryRepresentation: function(){
        return {};
    }

});

JSClass("BarItemButtonConfiguration", JSObject, {

    initWithDictionary: function(dictionary){
        this.label = dictionary.label;
        if (dictionary.image_url){
            this.imageURL = JSURL.initWithString(dictionary.image_url);
        }
        this.color = JSColor.initWithMorphicString(dictionary.color);
    },

    label: null,
    imageURL: null,
    color: null,

    dictionaryRepresentation: function(){
        return {
            label: this.label,
            image_url: this.imageURL !== null ? this.imageURL.encodedString : null,
            color: this.color !== null ? this.color.morphicString() : null
        };
    }

});


JSClass("BarItemLinkConfiguration", BarItemButtonConfiguration, {

    initWithDictionary: function(dictionary){
        BarItemLinkConfiguration.$super.initWithDictionary.call(this, dictionary);
        if (dictionary.subkind){
            this.subkind = dictionary.subkind;
        }
        if (dictionary.url){
            this.url = JSURL.initWithString(dictionary.url);
        }
    },

    subkind: null,
    url: null,

    dictionaryRepresentation: function(){
        var dictionary = BarItemLinkConfiguration.$super.dictionaryRepresentation.call(this);
        dictionary.url = this.url !== null ? this.url.encodedString : null;
        dictionary.subkind = this.subkind;
        return dictionary;
    }

});


JSClass("BarItemApplicationConfiguration", BarItemButtonConfiguration, {

    initWithDictionary: function(dictionary){
        BarItemLinkConfiguration.$super.initWithDictionary.call(this, dictionary);
        this.default = dictionary.default || null;
        this.exe = dictionary.exe || null;
    },

    default: null,
    exe: null,

    dictionaryRepresentation: function(){
        var dictionary = BarItemLinkConfiguration.$super.dictionaryRepresentation.call(this);
        dictionary.default = this.default;
        dictionary.exe = this.exe;
        return dictionary;
    }

});

JSClass("BarItemActionConfiguration", JSObject, {

    initWithDictionary: function(dictionary){
        this.identifier = dictionary.identifier;
        this.color = JSColor.initWithMorphicString(dictionary.color);
    },

    label: null,
    imageURL: null,
    color: null,

    dictionaryRepresentation: function(){
        return {
            identifier: this.identifier,
            color: this.color !== null ? this.color.morphicString() : null
        };
    }

});

JSColor.definePropertiesFromExtensions({

    initWithMorphicString: function(string){
        if (string === null || string === undefined){
            return null;
        }
        var matches = string.match(/^#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/);
        if (matches !== null){
            return JSColor.initWithRGBA(parseInt(matches[1], 16) / 255.0, parseInt(matches[2], 16) / 255.0, parseInt(matches[3], 16) / 255.0);
        }
        return null;
    },

    morphicString: function(){
        var rgbaColor = this.rgbaColor();
        return "#%02X%02X%02X".sprintf(Math.round(rgbaColor.red * 255), Math.round(rgbaColor.green * 255), Math.round(rgbaColor.blue * 255));
    }

});

JSColor.defineInitMethod("initWithMorphicString");

BarItem.Kind = {
    link: "link",
    application: "application",
    action: "action"
};