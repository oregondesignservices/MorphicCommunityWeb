// Copyright 2020 Raising the Floor - International
//
// Licensed under the New BSD license. You may not use this file except in
// compliance with this License.
//
// You may obtain a copy of the License at
// https://github.com/GPII/universal/blob/master/LICENSE.txt
//
// The R&D leading to these results received funding from the:
// * Rehabilitation Services Administration, US Dept. of Education under 
//   grant H421A150006 (APCP)
// * National Institute on Disability, Independent Living, and 
//   Rehabilitation Research (NIDILRR)
// * Administration for Independent Living & Dept. of Education under grants 
//   H133E080022 (RERC-IT) and H133E130028/90RE5003-01-00 (UIITA-RERC)
// * European Union's Seventh Framework Programme (FP7/2007-2013) grant 
//   agreement nos. 289016 (Cloud4all) and 610510 (Prosperity4All)
// * William and Flora Hewlett Foundation
// * Ontario Ministry of Research and Innovation
// * Canadian Foundation for Innovation
// * Adobe Foundation
// * Consumer Electronics Association Foundation

// #import UIKit
// #import "Service+Extensions.js"
'use strict';

JSClass("SidebarViewController", UIViewController, {

    service: JSDynamicProperty('_service', null),

    setService: function(service){
        this._service = service;
        this.communitiesViewController.service = service;
    },

    communitiesViewController: JSOutlet(),
    navigationController: JSOutlet(),
    watermarkView: JSOutlet(),

    // MARK: - View Lifecycle

    viewDidLoad: function(){
        SidebarViewController.$super.viewDidLoad.call(this);
        this.addChildViewController(this.navigationController);
        this.navigationController.navigationBar.hidden = true;
        this.view.addSubview(this.navigationController.view);
        this.view.setNeedsLayout();
    },

    viewWillAppear: function(animated){
        SidebarViewController.$super.viewWillAppear.call(this, animated);
        this.navigationController.viewWillAppear(animated);
    },

    viewDidAppear: function(animated){
        SidebarViewController.$super.viewDidAppear.call(this, animated);
        this.navigationController.viewDidAppear(animated);
    },

    viewWillDisappear: function(animated){
        SidebarViewController.$super.viewWillDisappear.call(this, animated);
        this.navigationController.viewWillDisappear(animated);
    },

    viewDidDisappear: function(animated){
        SidebarViewController.$super.viewDidDisappear.call(this, animated);
        this.navigationController.viewDidDisappear(animated);
    },

    // MARK: - Layout

    viewDidLayoutSubviews: function(){
        var bounds = this.view.bounds;
        this.navigationController.view.frame = bounds;
        this.watermarkView.bounds = JSRect(0, 0, bounds.size.width, bounds.size.width);
        this.watermarkView.position = JSPoint(bounds.center.x, bounds.size.height - 125 + bounds.size.width / 2.0); 
    }

});

JSClass("SidebarNavigationBarStyler", UINavigationBarDefaultStyler, {


    initWithSpec: function(spec){
        SidebarNavigationBarStyler.$super.initWithSpec.call(this, spec);
        if (spec.containsKey("height")){
            this.height = spec.valueForKey("height");
        }
    },

    layoutBar: function(navigationBar){
        SidebarNavigationBarStyler.$super.layoutBar.call(this, navigationBar);
        // IMPORTANT: assuming no left bar items
        var size = navigationBar.bounds.size;
        var props = navigationBar.stylerProperties;
        var xLeft = this.itemInsets.left;
        var xRight = size.width - this.itemInsets.right;
        var itemHeight = size.height - this.itemInsets.height;
        var y = this.itemInsets.top;
        if (props.rightBarItemViews.length > 0){
            xRight = props.rightBarItemViews[0].frame.origin.x;
        }
        if (!props.titleLabel.hidden){
            props.titleLabel.position = JSPoint(xLeft + props.titleLabel.bounds.size.width / 2.0, props.titleLabel.position.y);
        }
        if (props.backBarItemView !== null){
            props.backBarItemView.position = JSPoint(xLeft - props.backBarItemView.bounds.size.width / 2.0, props.backBarItemView.position.y);
        }
    },

});