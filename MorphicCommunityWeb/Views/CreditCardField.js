// #import UIKit
/* global Stripe */
'use strict';

JSClass("StripeElementField", UIControl, {

    initwithFrame: function(frame){
        StripeElementField.$super.initwithFrame.call(this, frame);
        this.setNeedsDisplay();
    },

    initWithSpec: function(spec){
        StripeElementField.$super.initWithSpec.call(this, spec);
        this.setNeedsDisplay();
    },

    stripeContainerElement: null,
    stripeElement: null,
    stripeReady: false,
    stripeElementOptions: JSReadOnlyProperty(),
    stripeElementsOptions: JSReadOnlyProperty(),

    createSharedStripeIfNeeded: function(document, completion, target){
        if (StripeElementField.sharedStripeCount === 0){
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "https://js.stripe.com/v3/";
            var key = this.window.application.getenv("STRIPE_PUBLIC_KEY");
            var onload = function(){
                script.removeEventListener("load", onload);
                StripeElementField.sharedStripeScript = script;
                StripeElementField.stripe = new Stripe(key);
                completion.call(target);
            };
            script.addEventListener("load", onload);
            document.body.appendChild(script);
        }
        ++StripeElementField.sharedStripeCount;
    },

    removeSharedStripe: function(){
        --StripeElementField.sharedStripeCount;
        if (StripeElementField.sharedStripeCount === 0){
            StripeElementField.sharedStripeScript.parentNode.removeChild(StripeElementField.sharedStripeScript);
            StripeElementField.sharedStripeScript = null;
        }
    },

    getStripeElementOptions: function(){
        return {};
    },

    getStripeElementsOptions: function(){
        return {};
    },

    setupIfNeeded: function(element){
        if (this.stripeElement !== null){
            return;
        }
        this.stripeContainerElement = element.ownerDocument.createElement("div");
        this.stripeContainerElement.style.position = "absolute";
        this.stripeContainerElement.style.right = "0";
        this.stripeContainerElement.style.bottom = "0";
        this.createSharedStripeIfNeeded(element.ownerDocument, function(){
            this.stripeElement = StripeElementField.stripe.elements(this.stripeElementsOptions).create(this.stripeElementType, this.stripeElementOptions);
            this.stripeElement.mount(this.stripeContainerElement);
            var field = this;
            this.stripeElement.on("ready", function(){
                field.stripeReady = true;
            });
            this.stripeElement.on("focus", function(){
                field.window.firstResponder = null;
                field.becomeFirstResponder();
            });
            this.stripeElement.on("blur", function(){
                field.resignFirstResponder();
            });
            this.setup();
        }, this);
    },

    drawLayerInContext: function(layer, context){
        if (context.isKindOfClass(UIHTMLDisplayServerContext)){
            this.setupIfNeeded(context.element);
            context.addExternalElementInRect(this.stripeContainerElement, this.layer.bounds);
        }
    }
    

});

JSClass("CreditCardField", StripeElementField, {

    stripeElementType: "card",

    initwithFrame: function(frame){
        CreditCardField.$super.initwithFrame.call(this, frame);
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
        if (this.textInsets === null){
            this.textInsets = JSInsets(3);
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
    textInsets: null,

    getStripeElementsOptions: function(){
        var descriptor = this.font.descriptor;
        if (descriptor.family == "Fira Sans"){
            return {
                fonts: [
                    {
                        cssSrc: "https://fonts.googleapis.com/css?family=Fira+Sans:%d&display=block".sprintf(descriptor.weight)
                    }
                ]
            };
        }
        return {
            fonts: [
                {
                    family: descriptor.family,
                    src: "url('%s%s')".sprintf(this.window.application.baseURL.encodedString, descriptor.htmlURLString()),
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

    setup: function(){
        var field = this;
        this.stripeContainerElement.style.top = this.textInsets.top + "px";
        this.stripeContainerElement.style.left = this.textInsets.left + "px";
        this.stripeContainerElement.style.bottom = this.textInsets.bottom + "px";
        this.stripeContainerElement.style.right = this.textInsets.right + "px";
        this.stripeElement.on("change", function(event){
            if (event.error){
                field.updateErrorMessage(event.error.message);
                return;
            }
            field.updateErrorMessage(null);
            if (event.complete){
                field.sendActionsForEvents(UIControl.Event.primaryAction | UIControl.Event.valueChanged);
            }
        });
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
        StripeElementField.stripe.createToken(this.stripeElement).then(function(result){
            if (result.error){
                completion.call(target, null);
                return;
            }
            completion.call(target, result.token);
        });
        return completion.promise;
    },

    getIntrinsicSize: function(){
        return JSSize(UIView.noIntrinsicSize, this.font.displayLineHeight + this.textInsets.height);
    }

});

StripeElementField.sharedStripeCount = 0;
StripeElementField.sharedStripeScript = null;
StripeElementField.stripe = null;