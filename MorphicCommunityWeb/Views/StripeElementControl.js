// #import UIKit
/* global Stripe */
'use strict';

(function(){

var stripe = null;
var sharedScript = null;
var sharedStripeCount = 0;

JSClass("StripeElementControl", UIControl, {

    layerDidCreateElement: function(layer){
        this.importStripe(layer.element.ownerDocument, function(){
            this.stripeElement = stripe.elements(this.stripeElementsOptions).create(this.stripeElementType, this.stripeElementOptions);
            this.stripeElement.mount(layer.element);
            this.stripeElementReadyHandler = this.stripeElementReady.bind(this);
            this.stripeElementFocusedHandler = this.stripeElementFocused.bind(this);
            this.stripeElementBlurredHandler = this.stripeElementBlurred.bind(this);
            this.stripeElement.on("ready", this.stripeElementReadyHandler);
            this.stripeElement.on("focus", this.stripeElementFocusedHandler);
            this.stripeElement.on("blur", this.stripeElementBlurredHandler);
            this.setup();
        }, this);
    },

    stripeElementReady: function(){
        this.stripeReady = true;
    },

    stripeElementFocused: function(){
        this.window.firstResponder = null;
        this.becomeFirstResponder();
    },

    stripeElementBlurred: function(){
        this.resignFirstResponder();
    },

    layerWillDestroyElement: function(layer){
        if (this.stripeElement !== null){
            this.teardown();
            this.stripeElement.off("ready", this.stripeElementReadyHandler);
            this.stripeElement.off("focus", this.stripeElementFocusedHandler);
            this.stripeElement.off("blur", this.stripeElementBlurredHandler);
            this.stripeElement.unmount();
            this.stripeElement.destroy();
        }
        this.unimportStripe();
    },

    stripeElementType: null, // must be set by subclass
    stripeElement: null,
    stripeElementReadyHandler: null,
    stripeElementFocusedHandler: null,
    stripeElementBlurredHandler: null,
    stripeReady: false,
    stripeElementOptions: JSReadOnlyProperty(),
    stripeElementsOptions: JSReadOnlyProperty(),

    importStripe: function(document, completion, target){
        if (sharedStripeCount === 0){
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "https://js.stripe.com/v3/";
            var key = StripeElementControl.stripePublicKey;
            var onload = function(){
                script.removeEventListener("load", onload);
                sharedScript = script;
                stripe = new Stripe(key);
                completion.call(target);
            };
            script.addEventListener("load", onload);
            document.body.appendChild(script);
        }else{
            JSRunLoop.main.schedule(completion, target);
        }
        ++sharedStripeCount;
    },

    unimportStripe: function(){
        // Stripe adds some extra iframes to the document that we
        // should probably clean up.  Maybe it's best to keep Stripe around
        // once it's loaded
        // --sharedStripeCount;
        // if (sharedStripeCount === 0){
        //     sharedScript.parentNode.removeChild(sharedScript);
        //     sharedScript = null;
        //     window.Stripe = null;
        // }
    },

    getStripeElementOptions: function(){
        return {};
    },

    getStripeElementsOptions: function(){
        return {};
    },

    drawLayerInContext: function(layer, context){
        layer.drawInContext(context);
    },

    setup: function(){
    },

    teardown: function(){
    }
    

});

StripeElementControl.layerClass = UIHTMLElementLayer;
StripeElementControl.stripePublicKey = null;
StripeElementControl.baseURL = null;

})();