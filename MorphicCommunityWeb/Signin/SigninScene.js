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