// #import UIKit
// #import "Service+Extensions.js"
'use strict';

JSClass("CommunityGeneralSettingsViewController", UIViewController, {

    community: null,
    service: null,

    // MARK: - View Lifecycle

    viewDidLoad: function(){
        CommunityGeneralSettingsViewController.$super.viewDidLoad.call(this);
    },

    viewWillAppear: function(animated){
        CommunityGeneralSettingsViewController.$super.viewWillAppear.call(this, animated);
    },

    viewDidAppear: function(animated){
        CommunityGeneralSettingsViewController.$super.viewDidAppear.call(this, animated);
    },

    viewWillDisappear: function(animated){
        CommunityGeneralSettingsViewController.$super.viewWillDisappear.call(this, animated);
    },

    viewDidDisappear: function(animated){
        CommunityGeneralSettingsViewController.$super.viewDidDisappear.call(this, animated);
    },

    // MARK: - Saving

    changed: false,

    // MARK: - Form

    form: JSOutlet(),
    nameField: JSOutlet(),

    nameChanged: function(){
        this.service.saveCommunity(this.community.dictionaryRepresentation(), function(result){
            if (result !== Service.Result.success){
                // TODO: show error?? window might be closing
            }
        });
    },

    textFieldDidReceiveEnter: function(textField){
        if (textField === this.nameField){
            this.view.window.firstResponder = null;
        }
    },

    // MARK: - Layout

    viewDidLayoutSubviews: function(){
        this.form.frame = this.view.bounds;
    }

});