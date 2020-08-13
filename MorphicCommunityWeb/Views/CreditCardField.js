// #import UIKit
// #import "StripeElementControl.js"
/* global Stripe */
'use strict';

JSClass("CreditCardField", StripeElementControl, {

    stripeElementType: "card",

    initwithFrame: function(frame){
        CreditCardField.$super.initwithFrame.call(this, frame);
        this.textInsets = JSInsets(3);
        this.fillInStyles();
    },

    initWithSpec: function(spec){
        CreditCardField.$super.initWithSpec.call(this, spec);
        if (spec.containsKey("textColor")){
            this.textColor = spec.valueForKey("textColor", JSColor);
        }
        if (spec.containsKey("placeholderColor")){
            this.placeholderColor = spec.valueForKey("placeholderColor", JSColor);
        }
        if (spec.containsKey("iconColor")){
            this.iconColor = spec.valueForKey("iconColor", JSColor);
        }
        if (spec.containsKey("invalidColor")){
            this.invalidColor = spec.valueForKey("invalidColor", JSColor);
        }
        if (spec.containsKey("activeColor")){
            this.activeColor = spec.valueForKey("activeColor", JSColor);
        }
        if (spec.containsKey("inactiveColor")){
            this.inactiveColor = spec.valueForKey("inactiveColor", JSColor);
        }
        if (spec.containsKey("textInsets")){
            this.textInsets = spec.valueForKey("textInsets", JSInsets);
        }else{
            this.textInsets = JSInsets(3);
        }
        if (spec.containsKey("cursorColor")){
            this.cursorColor = spec.valueForKey("cursorColor", JSColor);
        }
        if (spec.containsKey("font")){
            this.font = spec.valueForKey("font", JSFont);
        }
        this.fillInStyles();
    },

    fillInStyles: function(){
        if (this.font === null){
            this.font = JSFont.systemFontOfSize(JSFont.Size.normal);
        }
        if (this.textColor === null){
            this.textColor = JSColor.black;
        }
        if (this.placeholderColor === null){
            this.placeholderColor = this.textColor.colorWithAlpha(0.5);
        }
        if (this.iconColor === null){
            this.iconColor = this.textColor;
        }
        if (this.invalidColor === null){
            this.invalidColor = JSColor.initWithRGBA(129/255.0, 43/255.0, 0);
        }
        if (this.activeColor === null){
            this.activeColor = JSColor.black;
        }
        if (this.inactiveColor === null){
            this.inactiveColor = JSColor.initWithWhite(0.8);
        }
        if (this.cursorColor === null){
            this.cursorColor = JSColor.initWithRGBA(0, 128/255.0, 255/255.0, 1.0);
        }
        this.cursor = UICursor.iBeam;
        this.borderColor = this.inactiveColor;
    },

    font: null,
    cursorColor: null,
    activeColor: null,
    inactiveColor: null,
    textColor: null,
    placeholderColor: null,
    invalidColor: null,
    iconColor: null,
    errorMessage: null,
    textInsets: JSDynamicProperty(),

    setTextInsets: function(textInsets){
        this.layer.elementInsets = textInsets;
    },

    getTextInsets: function(){
        return this.layer.elementInsets;
    },

    getStripeElementsOptions: function(){
        var descriptor = this.font.descriptor;
        var baseURL = StripeElementControl.baseURL;
        if (baseURL.scheme === "http"){
            // Stripe won't accept http urls, only https and data.
            // We can make a data url if we really need to, but insetad we'll
            // assume we're using a Google Font and just point there
            var googleURL = JSURL.initWithString("https://fonts.googleapis.com/css");
            var query = JSFormFieldMap();
            query.add("family", "%s:%d".sprintf(descriptor.family, descriptor.weight));
            googleURL.query = query;
            return {
                fonts: [
                    {
                        cssSrc: googleURL.encodedString
                    }
                ]
            };
        }
        return {
            fonts: [
                {
                    family: descriptor.family,
                    src: "url('%s')".sprintf(JSURL.initWithString(descriptor.htmlURLString(), baseURL).encodedString),
                    display: "block",
                    style: descriptor.style,
                    weight: descriptor.weight
                }
            ]
        };
    },

    getStripeElementOptions: function(){
        return {
            style: {
                base: {
                    backgroundColor: this.backgroundColor !== null ? this.backgroundColor.cssString() : "",
                    color: this.textColor.cssString(),
                    iconColor: this.iconColor.cssString(),
                    fontFamily: this.font.familyName,
                    fontSize: this.font.pointSize + "px",
                    fontStyle: this.font.descriptor.style,
                    fontWeight: this.font.descriptor.weight,
                    // caretColor: this.cursorColor.cssString(),
                    "::placeholder": {
                        color: this.placeholderColor.cssString(),
                    }
                },
                invalid: {
                    color: this.invalidColor.cssString(),
                    iconColor: this.invalidColor.cssString()
                }
            }
        };
    },

    stripeElementChangeHandler: null,

    setup: function(){
        this.stripeElementChangeHandler = this.stripeElementChange.bind(this);
        this.stripeElement.on("change", this.stripeElementChangeHandler);
    },

    teardown: function(){
        this.stripeElement.off("change", this.stripeElementChangeHandler);
    },

    stripeElementChange: function(event){
        if (event.error){
            this.updateErrorMessage(event.error.message);
            return;
        }
        this.updateErrorMessage(null);
        if (event.complete){
            this.sendActionsForEvents(UIControl.Event.primaryAction | UIControl.Event.valueChanged);
        }
    },

    canBecomeFirstResponder: function(){
        return false;
    },

    becomeFirstResponder: function(){
        this.borderColor = this.activeColor;
    },

    resignFirstResponder: function(){
        this.borderColor = this.inactiveColor;
    },

    updateErrorMessage: function(errorMessage){
        if (errorMessage !== this.errorMessage){
            this.didChangeValueForBinding("errorMessage");
        }
    },

    getFirstBaselineOffsetFromTop: function(){
        return this.textInsets.top + this.font.displayAscender;
    },

    getLastBaselineOffsetFromBottom: function(){
        return this.textInsets.bottom - this.font.displayDescender;
    },

    createStripeToken: function(completion, target){
        if (!completion){
            completion = Promise.completion();
        }
        this.stripe.createToken(this.stripeElement).then(function(result){
            completion.call(target, result.error, result.token);
        });
        return completion.promise;
    },

    getIntrinsicSize: function(){
        return JSSize(UIView.noIntrinsicSize, this.font.displayLineHeight + this.textInsets.height);
    }

});