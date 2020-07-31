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

    // MARK: - Saving

    changed: false,

    // MARK: - Form

    scrollView: JSOutlet(),
    form: JSOutlet(),
    nameField: JSOutlet(),

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