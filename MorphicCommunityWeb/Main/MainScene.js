// #import UIKit
'use strict';

JSClass("MainScene", UIScene, {

    sidebarViewController: JSOutlet(),

    service: JSDynamicProperty('_service', null),

    setService: function(service){
        this._service = service;
        this.sidebarViewController.service = service;
    }

});