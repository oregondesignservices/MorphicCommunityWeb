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

JSClass("BarItemDetailViewTextFieldStyler", UITextFieldStyler, {

    showsOverState: false,
    textInsets: null,
    backgroundColor: null,
    activeBackgroundColor: null,
    disabledBackgroundColor: null,
    borderColor: null,
    activeBorderColor: null,
    disabledBorderColor: null,
    textColor: null,
    placeholderColor: null,
    cornerRadius: 0,

    init: function(){
        BarItemDetailViewTextFieldStyler.$super.init.call(this);
        this.backgroundColor = JSColor.white.colorWithAlpha(0.5);
        this.activeBackgroundColor = JSColor.white;
        this.disabledBackgroundColor = JSColor.clear;
        this.textColor = JSColor.black;
        this.placeholderColor = JSColor.black.colorWithAlpha(0.4);
        this.textInsets = JSInsets(3);
        this.cornerRadius = 2;
        this.borderColor = JSColor.black.colorWithAlpha(0.1);
        this.activeBorderColor = JSColor.black.colorWithAlpha(0.4);
        this.disabledBorderColor = JSColor.clear;
    },

    initializeControl: function(textField){
        BarItemDetailViewTextFieldStyler.$super.initializeControl.call(this, textField);
        textField.cornerRadius = this.cornerRadius;
        if (this.textColor !== null){
            textField.textColor = this.textColor;
        }
        if (this.placeholderColor !== null){
            textField.placeholderColor = this.placeholderColor;
        }
        if (this.textInsets !== null){
            textField.textInsets = this.textInsets;
        }
        textField.borderWidth = 1;
        this.updateControl(textField);
    },

    updateControl: function(textField){
        BarItemDetailViewTextFieldStyler.$super.updateControl.call(this, textField);
        if (textField.active){
            textField.backgroundColor = this.activeBackgroundColor;
            textField.borderColor = this.activeBorderColor;
        }else if (!textField.enabled){
            textField.backgroundColor = this.disabledBackgroundColor;
            textField.borderColor = this.disabledBorderColor;
        }else{
            textField.backgroundColor = this.backgroundColor;
            textField.borderColor = this.borderColor;
        }
    }

});