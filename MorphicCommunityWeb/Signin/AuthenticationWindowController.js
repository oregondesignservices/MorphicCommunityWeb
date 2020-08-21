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
// #import SecurityKit
// #import "Service+Extensions.js"
'use strict';

JSProtocol("AuthenticationWindowControllerDelegate", JSProtocol, {

    authenticationWindowControllerDidSignin: function(controller, username, auth){ }

});

JSClass("AuthenticationWindowController", UIWindowController, {

    service: null,
    username: null,

    authenticationDelegate: null,

    // MARK: - View Lifecycle

    awakeFromSpec: function(){
        this.contentInsets = JSInsets(20);
    },

    viewDidLoad: function(){
        AuthenticationWindowController.$super.viewDidLoad.call(this);
        this.forgotPasswordButton.titleLabel.textColor = JSColor.initWithWhite(0.4);
        this.usernameValueLabel.text = this.username;
    },

    viewWillAppear: function(animated){
        AuthenticationWindowController.$super.viewWillAppear.call(this, animated);
    },

    viewDidAppear: function(animated){
        AuthenticationWindowController.$super.viewDidAppear.call(this, animated);
    },

    viewWillDisappear: function(animated){
        AuthenticationWindowController.$super.viewWillDisappear.call(this, animated);
    },

    viewDidDisappear: function(animated){
        AuthenticationWindowController.$super.viewDidDisappear.call(this, animated);
    },

    saveLogin: function(username, password, completion, target){
        var defaults = this.service.defaults;
        var item = {id: defaults.valueForKey("loginKeychainId"), username: username, password: password};
        if (item.id === null){
            SECKeychain.device.add(item, function(id){
                if (id !== null){
                    defaults.setValueForKey(id, "loginKeychainId");
                }
            });
        }else{
            SECKeychain.device.update(item, function(id){
            });
        }
    },

    // MARK: - Signin Action

    logoImageView: JSOutlet(),
    form: JSOutlet(),
    usernameValueLabel: JSOutlet(),
    passwordField: JSOutlet(),
    signinButton: JSOutlet(),
    forgotPasswordButton: JSOutlet(),

    signin: function(){
        if (!this.signinButton.enabled){
            return;
        }
        this.setFieldsEnabled(false);
        var password = this.passwordField.text;
        this.service.authenticateWithUsername(this.username, password, function(result, auth){
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
            this.saveLogin(this.username, password);
            this.authenticationDelegate.authenticationWindowControllerDidSignin(this, this.username, auth);
        }, this);
    },

    forgotPassword: function(){
        var application = this.view.window.application;
        var url = JSURL.initWithString(application.getenv("PASSWORD_FRONT_END_URL"));
        url.appendPathComponents(["password", "reset"]);
        application.openURL(url);
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
        this.signinButton.enabled = this.passwordField.text.length > 0;
    },

    setFieldsEnabled: function(enabled){
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