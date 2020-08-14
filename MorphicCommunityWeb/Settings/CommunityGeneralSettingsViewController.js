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

JSClass("CommunityGeneralSettingsViewController", UIViewController, {

    community: null,
    service: null,
    communitySaveSynchronizer: null,

    // MARK: - View Lifecycle

    viewDidLoad: function(){
        CommunityGeneralSettingsViewController.$super.viewDidLoad.call(this);
        this.update();
    },

    viewWillAppear: function(animated){
        CommunityGeneralSettingsViewController.$super.viewWillAppear.call(this, animated);
    },

    viewDidAppear: function(animated){
        CommunityGeneralSettingsViewController.$super.viewDidAppear.call(this, animated);
    },

    viewWillDisappear: function(animated){
        CommunityGeneralSettingsViewController.$super.viewWillDisappear.call(this, animated);
        if (this.nameField.window && this.nameField.window.firstResponder === this.nameField){
            this.nameField.window.firstResponder = null;
        }
    },

    viewDidDisappear: function(animated){
        CommunityGeneralSettingsViewController.$super.viewDidDisappear.call(this, animated);
    },

    update: function(){
        if (this.community.memberLimit > 0){
            var format = JSBundle.mainBundle.localizedString("fields.members.format", "CommunityGeneralSettingsViewController");
            this.membersValueLabel.text = String.initWithFormat(format, this.community.memberCount, this.community.memberLimit);
        }else{
            this.membersValueLabel.text = JSBundle.mainBundle.localizedString("fields.members.unlimited", "CommunityGeneralSettingsViewController");
        }
    },

    // MARK: - Saving

    changed: false,

    // MARK: - Form

    scrollView: JSOutlet(),
    form: JSOutlet(),
    nameField: JSOutlet(),
    membersValueLabel: JSOutlet(),

    nameChanged: function(){
        this.communitySaveSynchronizer.sync();
    },

    textFieldDidReceiveEnter: function(textField){
        if (textField === this.nameField){
            this.view.window.firstResponder = null;
        }
    },

    // MARK: - Layout

    viewDidLayoutSubviews: function(){
        this.scrollView.frame = this.view.bounds;
        var formSize = this.form.intrinsicSize;
        this.scrollView.contentSize = JSSize(this.view.bounds.size.width, formSize.height + 40);
        this.form.frame = JSRect(20, 20, this.view.bounds.size.width - 40, formSize.height);
    }

});