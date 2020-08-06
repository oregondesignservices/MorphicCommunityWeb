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

JSProtocol("SigninViewControllerDelegate", JSProtocol, {

    signinViewControllerDidSignin: function(viewController, auth){ }

});

JSClass("SigninViewController", UIViewController, {

    initWithSpec: function(spec){
        SigninViewController.$super.initWithSpec.call(this, spec);
        if (spec.containsKey("delegate")){
            this.delegate = spec.valueForKey("delegate");
        }
    },

    service: null,

    delegate: null,

    // MARK: - View Lifecycle

    awakeFromSpec: function(){
        this.contentInsets = JSInsets(20);
    },

    viewDidLoad: function(){
        SigninViewController.$super.viewDidLoad.call(this);
        this.forgotPasswordButton.cursor = UICursor.pointingHand;
        this.forgotPasswordButton.titleLabel.textColor = JSColor.initWithWhite(0.4);
        this.signinButton.enabled = false;
    },

    viewWillAppear: function(animated){
        SigninViewController.$super.viewWillAppear.call(this, animated);
    },

    viewDidAppear: function(animated){
        SigninViewController.$super.viewDidAppear.call(this, animated);
    },

    viewWillDisappear: function(animated){
        SigninViewController.$super.viewWillDisappear.call(this, animated);
    },

    viewDidDisappear: function(animated){
        SigninViewController.$super.viewDidDisappear.call(this, animated);
    },

    // MARK: - Signin Action

    logoImageView: JSOutlet(),
    form: JSOutlet(),
    usernameField: JSOutlet(),
    passwordField: JSOutlet(),
    signinButton: JSOutlet(),
    forgotPasswordButton: JSOutlet(),

    signin: function(){
        if (!this.signinButton.enabled){
            return;
        }
        this.setFieldsEnabled(false);
        this.service.authenticateWithUsername(this.usernameField.text, this.passwordField.text, function(result, auth){
            if (result !== Service.Result.success || auth === null){
                this.setFieldsEnabled(true);
                this.view.window.firstResponder = this.passwordField;
                var alert = UIAlertController.initWithTitle(
                    JSBundle.mainBundle.localizedString("errors.authFailed.title", "SigninScene"),
                    JSBundle.mainBundle.localizedString("errors.authFailed.message", "SigninScene")
                );
                alert.addAction(UIAlertAction.initWithTitle(
                    JSBundle.mainBundle.localizedString("errors.authFailed.dismiss.title", "SigninScene"),
                    UIAlertAction.Style.cancel
                ));
                alert.popupCenteredInView(this.view, true);
                return;
            }
            this.delegate.signinViewControllerDidSignin(this, auth);
        }, this);
    },

    forgotPassword: function(){
        // TODO:
    },

    textFieldDidReceiveEnter: function(textField){
        if (textField === this.passwordField){
            this.signin();
        }
    },

    textFieldDidChange: function(textField){
        this.updateValidation();
    },

    // MARK: - Validation

    updateValidation: function(){
        this.signinButton.enabled = this.usernameField.text.length > 0 && this.passwordField.text.length > 0;
    },

    setFieldsEnabled: function(enabled){
        this.usernameField.enabled = enabled;
        this.passwordField.enabled = enabled;
        this.signinButton.enabled = enabled;
        this.forgotPasswordButton.enabled = enabled;
    },

    // MARK: - Layout

    contentInsets: null,

    contentSizeThatFitsSize: function(size){
        var contentSize = JSSize(size.width + this.contentInsets.width, this.contentInsets.height);
        contentSize.height += this.logoImageView.bounds.size.height;
        contentSize.height += 13;
        contentSize.height += this.form.intrinsicSize.height;
        return contentSize;
    },

    viewDidLayoutSubviews: function(){
        var y = this.contentInsets.top;
        var x = this.contentInsets.left;
        var width = this.view.bounds.size.width - this.contentInsets.width;
        var centerX = x + width / 2.0;
        this.logoImageView.position = JSPoint(centerX, y + this.logoImageView.bounds.size.height / 2.0);
        y += this.logoImageView.bounds.size.height;
        y += 13;
        this.form.frame = JSRect(x, y, width, this.view.bounds.size.height - this.contentInsets.bottom - y);
    }

});