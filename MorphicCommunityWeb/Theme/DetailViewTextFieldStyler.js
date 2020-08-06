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

// #import UIKit
'use strict';

JSClass("DetailViewTextFieldStyler", UITextFieldStyler, {

    showsOverState: true,
    overBackgroundColor: null,
    activeBackgroundColor: null,
    textColor: null,
    placeholderColor: null,
    cornerRadius: 2,
    textInsets: null,

    initWithTextColor: function(textColor, placeholderColor){
        DetailViewTextFieldStyler.$super.init.call(this);
        this.textColor = textColor;
        this.placeholderColor = placeholderColor || null;
        this._commonInit();
    },

    initWithSpec: function(spec){
        UITextFieldCustomStyler.$super.initWithSpec.call(this, spec);
        if (spec.containsKey('textColor')){
            this.textColor = spec.valueForKey("textColor", JSColor);
        }
        if (spec.containsKey('placeholderColor')){
            this.placeholderColor = spec.valueForKey("placeholderColor", JSColor);
        }
        this._commonInit();
    },

    _commonInit: function(){
        if (this.placeholderColor === null){
            this.placeholderColor = this.textColor.colorLightenedByPercentage(0.5);
        }
        this.overBackgroundColor = this.localCursorColor.colorWithAlpha(0.1);
        this.activeBackgroundColor = this.localCursorColor.colorWithAlpha(0.6);
        this.textInsets = JSInsets(3);
    },

    initializeControl: function(textField){
        UITextFieldCustomStyler.$super.initializeControl.call(this, textField);
        textField.cornerRadius = this.cornerRadius;
        textField.stylerProperties.activeTextBackgroundLayer = UILayer.init();
        textField.stylerProperties.activeTextBackgroundLayer.backgroundColor = JSColor.white;
        textField.stylerProperties.activeTextBackgroundLayer.cornerRadius = 1;
        textField.layer.insertSublayerAtIndex(textField.stylerProperties.activeTextBackgroundLayer, 0);
        textField.hasOverState = this.showsOverState;
        if (this.textColor !== null){
            textField.textColor = this.textColor;
        }
        if (this.placeholderColor !== null){
            textField.placeholderColor = this.placeholderColor;
        }
        if (this.textInsets !== null){
            textField.textInsets = this.textInsets;
        }
        this.updateControl(textField);
    },

    updateControl: function(textField){
        UITextFieldCustomStyler.$super.updateControl.call(this, textField);
        if (textField.active){
            textField.backgroundColor = this.activeBackgroundColor;
            textField.stylerProperties.activeTextBackgroundLayer.hidden = false;
        }else if (textField.over){
            textField.stylerProperties.activeTextBackgroundLayer.hidden = true;
            textField.backgroundColor = this.overBackgroundColor;
        }else{
            textField.stylerProperties.activeTextBackgroundLayer.hidden = true;
            textField.backgroundColor = null;
        }
    },

    layoutControl: function(textField){
        textField.stylerProperties.activeTextBackgroundLayer.frame = textField.bounds.rectWithInsets(textField.textInsets.insetsWithInsets(-1));
    },

    intrinsicSizeOfControl: function(textField){

    }

});