// #import UIKit
'use strict';

JSProtocol("RegisterSceneDelegate", JSProtocol, {

    registerSceneDidComplete: function(scene, community){}

});

JSClass("RegisterScene", UIScene, {

    delegate: null,
    backgroundWindow: JSOutlet(),
    registerWindow: JSOutlet(),
    registerViewController: JSOutlet(),

    show: function(){
        this.registerWindow.sizeToFit();
        this.registerWindow.position = this.registerWindow.windowServer.screen.availableFrame.center;
        RegisterScene.$super.show.call(this);
    },

    service: JSDynamicProperty('_service', null),

    setService: function(service){
        this._service = service;
        this.registerViewController.service = service;
    },

    registerViewControllerDidComplete: function(vc, community){
        this.delegate.registerSceneDidComplete(this, community);
    }

});