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