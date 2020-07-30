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