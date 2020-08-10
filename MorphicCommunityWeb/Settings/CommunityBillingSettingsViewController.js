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
'use strict';

JSClass("CommunityBillingSettingsViewController", UIViewController, {

    // MARK: - View Lifecycle

    viewDidLoad: function(){
        CommunityBillingSettingsViewController.$super.viewDidLoad.call(this);
    },

    viewWillAppear: function(animated){
        CommunityBillingSettingsViewController.$super.viewWillAppear.call(this, animated);
    },

    viewDidAppear: function(animated){
        CommunityBillingSettingsViewController.$super.viewDidAppear.call(this, animated);
    },

    viewWillDisappear: function(animated){
        CommunityBillingSettingsViewController.$super.viewWillDisappear.call(this, animated);
    },

    viewDidDisappear: function(animated){
        CommunityBillingSettingsViewController.$super.viewDidDisappear.call(this, animated);
    },

    // Credit Card

    creditCardField: JSOutlet(),
    subscribeButton: JSOutlet(),

    viewDidLayoutSubviews: function(){
        var insets = JSInsets(20);
        this.subscribeButton.sizeToFit();
        this.subscribeButton.frame = JSRect(this.view.bounds.size.width - insets.right - this.subscribeButton.bounds.size.width, insets.top, this.subscribeButton.bounds.size.width, this.subscribeButton.bounds.size.height);
        var right = this.subscribeButton.frame.origin.x - 7;
        this.creditCardField.frame = JSRect(insets.left, this.subscribeButton.frame.origin.y + this.subscribeButton.firstBaselineOffsetFromTop - this.creditCardField.firstBaselineOffsetFromTop, right - insets.left, this.creditCardField.intrinsicSize.height);
    },

});

JSClass("CommunityBillingPlanView", UIControl, {

    nameLabel: null,
    priceLabel: null,

    priceFormatter: null,

    initWithSpec: function(spec){
        CommunityBillingPlanView.$super.initWithSpec.call(this, spec);
        if (spec.containsKey("name")){
            this.name = spec.valueForKey("name");
        }
        if (spec.containsKey("price")){
            this.price = spec.valueForKey("price");
        }
    },

});