// #import UIKit
// #import "Service+Extensions.js"
'use strict';

JSClass("SidebarViewController", UIViewController, {

    service: JSDynamicProperty('_service', null),

    setService: function(service){
        this._service = service;
        this.communitiesViewController.service = service;
    },

    defaults: JSDynamicProperty('_defaults', null),

    setDefaults: function(defaults){
        this._defaults = defaults;
        this.communitiesViewController.defaults = defaults;
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
        if (props.backBarItemView !== null){
            props.backBarItemView.position = JSPoint(16 + props.backBarItemView.bounds.size.width / 2.0, props.backBarItemView.position.y);
        }
        if (props.rightBarItemViews.length > 0){
            xRight = props.rightBarItemViews[0].frame.origin.x;
        }
        if (!props.titleLabel.hidden){
            props.titleLabel.position = JSPoint(xLeft + props.titleLabel.bounds.size.width / 2.0, props.titleLabel.position.y);
        }
    },

});