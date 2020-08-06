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