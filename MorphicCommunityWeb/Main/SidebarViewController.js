// #import UIKit
'use strict';

JSClass("SidebarViewController", UIViewController, {

    service: null,

    // MARK: - View Lifecycle

    viewDidLoad: function(){
        SidebarViewController.$super.viewDidLoad.call(this);
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
        this.view.backgroundGradient = gradient;
        this.loadCommunities();
    },

    viewWillAppear: function(animated){
        SidebarViewController.$super.viewWillAppear.call(this, animated);
    },

    viewDidAppear: function(animated){
        SidebarViewController.$super.viewDidAppear.call(this, animated);
    },

    viewWillDisappear: function(animated){
        SidebarViewController.$super.viewWillDisappear.call(this, animated);
    },

    viewDidDisappear: function(animated){
        SidebarViewController.$super.viewDidDisappear.call(this, animated);
    },

    // MARK: - Data Loading

    errorView: JSOutlet(),
    emptyView: JSOutlet(),

    communities: null,
    bars: null,
    memebers: null,

    loadCommunities: function(){
        // TODO: loading indicator
        this.errorView.hidden = true;
        this.emptyView.hidden = true;
        this.service.loadCommunities(function(page){
            if (page === null){
                this.errorView.hidden = false;
                return;
            }
            this.communities = [];
            for (var i = 0, l = page.communities.length; i < l; ++i){
                if (page.communities[i].role == "manager"){
                    this.communities.push(page.communities);
                }
            }
            if (this.communities.length === 0){
                this.emptyView.hidden = false;
                return;
            }
            // TODO: load bars and members for first community
        }, this);
    },

    // MARK: - Table View Data Source & Delegate

    // MARK: - Layout

    viewDidLayoutSubviews: function(){
        this.errorView.sizeToFitSize(this.view.bounds.rectWithInsets(20));
        this.errorView.position = this.view.bounds.center;
    }

});