// #import UIKit
'use strict';

JSClass("MainScene", UIScene, {

    sidebarViewController: JSOutlet(),

    service: JSDynamicProperty('_service', null),

    setService: function(service){
        this._service = service;
        this.sidebarViewController.service = service;
    },

    defaults: JSDynamicProperty('_defaults', null),

    setDefaults: function(defaults){
        this._defaults = defaults;
        this.sidebarViewController.defaults = defaults;
    },
});