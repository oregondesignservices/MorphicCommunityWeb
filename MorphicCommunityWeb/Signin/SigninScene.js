// #import UIKit
'use strict';

JSProtocol("SigninSceneDelegate", JSProtocol, {

    signinSceneDidComplete: function(scene, auth){}

});

JSClass("SigninScene", UIScene, {

    delegate: null,
    backgroundWindow: JSOutlet(),
    signinWindow: JSOutlet(),
    signinViewController: JSOutlet(),

    awakeFromSpec: function(){
        var gradient = JSGradient.initWithStops(
            0.00, JSColor.initWithRGBA(0x00/255.0, 0x81/255.0, 0x45/255.0),
            0.19, JSColor.initWithRGBA(0x00/255.0, 0x92/255.0, 0x4C/255.0),
            0.43, JSColor.initWithRGBA(0x3F/255.0, 0xA5/255.0, 0x54/255.0),
            0.65, JSColor.initWithRGBA(0x66/255.0, 0xB5/255.0, 0x5A/255.0),
            0.85, JSColor.initWithRGBA(0x7C/255.0, 0xC0/255.0, 0x5F/255.0),
            1.00, JSColor.initWithRGBA(0x84/255.0, 0xC6/255.0, 0x61/255.0)
        );
        gradient.start = JSPoint(0, 1);
        gradient.end = JSPoint(0, 0);
        this.backgroundWindow.backgroundGradient = gradient;
        this.signinWindow.allowsClose = false;
        this.signinViewController.delegate = this;
    },

    show: function(){
        this.signinWindow.sizeToFit();
        this.signinWindow.position = this.signinWindow.windowServer.screen.availableFrame.center;
        SigninScene.$super.show.call(this);
    },

    service: JSDynamicProperty('_service', null),

    setService: function(service){
        this._service = service;
        this.signinViewController.service = service;
    },

    signinViewControllerDidSignin: function(vc, auth){
        this.delegate.signinSceneDidComplete(this, auth);
    }

});