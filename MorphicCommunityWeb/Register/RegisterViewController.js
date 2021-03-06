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

JSProtocol("RegisterViewControllerDelegate", JSProtocol, {

    registerViewControllerDidComplete: function(viewController, community){}

});

JSClass("RegisterViewController", UIViewController, {

    initWithSpec: function(spec){
        RegisterViewController.$super.initWithSpec.call(this, spec);
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
        RegisterViewController.$super.viewDidLoad.call(this);
        this.submitButton.enabled = false;
    },

    viewWillAppear: function(animated){
        RegisterViewController.$super.viewWillAppear.call(this, animated);
    },

    viewDidAppear: function(animated){
        RegisterViewController.$super.viewDidAppear.call(this, animated);
    },

    viewWillDisappear: function(animated){
        RegisterViewController.$super.viewWillDisappear.call(this, animated);
    },

    viewDidDisappear: function(animated){
        RegisterViewController.$super.viewDidDisappear.call(this, animated);
    },

    // MARK: - Saved Login

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

    // MARK: - Registration

    logoImageView: JSOutlet(),
    form: JSOutlet(),
    communityNameField: JSOutlet(),
    firstNameField: JSOutlet(),
    lastNameField: JSOutlet(),
    emailField: JSOutlet(),
    passwordField: JSOutlet(),
    confirmPasswordField: JSOutlet(),
    submitButton: JSOutlet(),

    register: function(){
        if (!this.submitButton.enabled){
            return;
        }
        if (this.passwordField.text !== this.confirmPasswordField.text){
            this.showErrorMessageForField(JSBundle.mainBundle.localizedString("errors.passwordMismatch.message", "RegisterScene"), this.confirmPasswordField);
            return;
        }
        var username = this.emailField.text;
        var password = this.passwordField.text;
        this.setFieldsEnabled(false);
        if (this.service.authToken !== null){
            this.createCommunity();
        }else{
            this.service.registerWithUsername(username, password, this.firstNameField.text, this.lastNameField.text, function(result, auth, badRequest){
                if (result === Service.Result.success){
                    this.service.signin(username, auth);
                    this.createCommunity();
                    this.saveLogin(username, password);
                    return;
                }
                this.setFieldsEnabled(true);
                if (result === Service.Result.badRequest){
                    this.showFieldError(badRequest);
                    return;
                }
                this.showGeneralError();
            }, this);
        }
    },

    createCommunity: function(completion, target){
        this.service.createCommunity({name: this.communityNameField.text}, function(result, response, badRequest){
            if (result === Service.Result.success){
                var community = response.community;
                if (this.delegate && this.delegate.registerViewControllerDidComplete){
                    this.delegate.registerViewControllerDidComplete(this, community);
                }
                return;
            }
            this.setFieldsEnabled(true);
            if (result === Service.Result.badRequest){
                this.showFieldError(badRequest);
                return;
            }
            this.showGeneralError();
        }, this);
    },

    showGeneralError: function(){
        this.view.window.firstResponder = this.confirmPasswordField;
        var alert = UIAlertController.initWithTitle(
            JSBundle.mainBundle.localizedString("errors.server.title", "RegisterScene"),
            JSBundle.mainBundle.localizedString("errors.server.message", "RegisterScene")
        );
        alert.addAction(UIAlertAction.initWithTitle(
            JSBundle.mainBundle.localizedString("errors.server.dismiss.title", "RegisterScene"),
            UIAlertAction.Style.cancel
        ));
        alert.popupCenteredInView(this.view, true);
    },

    showFieldError: function(badRequest){
        var field = null;
        var message = null;
        if (badRequest.error === "existing_username" || badRequest.error === "existing_email"){
            field = this.emailField;
            message = JSBundle.mainBundle.localizedString("errors.emailExists.message", "RegisterScene");
        }else if (badRequest.error === "malformed_email"){
            message = JSBundle.mainBundle.localizedString("errors.emailMalformed.message", "RegisterScene");
            field = this.emailField;
        }else if (badRequest.error === "bad_password"){
            message = JSBundle.mainBundle.localizedString("errors.badPassword.message", "RegisterScene");
            field = this.passwordField;
        }else if (badRequest.error === "short_password"){
            message = String.initWithFormat(JSBundle.mainBundle.localizedString("errors.shortPassword.message", "RegisterScene"), badRequest.details.minimum_length);
            field = this.passwordField;
        }
        if (field != null){
            this.showErrorMessageForField(message, field);
        }
    },

    errorField: null,
    errorPopupWindow: null,

    showErrorMessageForField: function(message, field){
        this.clearFieldErrorMessage();
        this.errorField = field;
        var label = UILabel.init();
        label.text = message;
        this.errorPopupWindow = UIPopupWindow.init();
        this.errorPopupWindow.canBecomeKey = false;
        this.errorPopupWindow.contentView = label;
        this.errorPopupWindow.openAdjacentToView(this.errorField, UIPopupWindow.Placement.right);
        this.errorField.window.firstResponder = this.errorField;
    },

    clearFieldErrorMessage: function(){
        if (this.errorPopupWindow !== null){
            this.errorPopupWindow.close();
            this.errorPopupWindow = null;
            this.errorField = null;
        }
    },

    // MARK: - Validation

    textFieldDidChange: function(textField){
        if (this.errorPopupWindow && (textField === this.errorField) || (this.errorField === this.confirmPasswordField && textField === this.passwordField)){
            this.clearFieldErrorMessage();
        }
        this.updateValidation();
    },

    textFieldDidReceiveEnter: function(textField){
        if (textField === this.confirmPasswordField){
            this.confirmPasswordField.window.firstResponder = null;
            this.register();
        }
    },

    updateValidation: function(){
        this.submitButton.enabled = this.communityNameField.text !== "" && this.firstNameField.text !== "" && this.lastNameField.text !== "" && this.emailField.text !== "" && this.passwordField.text !== "" && this.confirmPasswordField.text !== "";
    },

    setFieldsEnabled: function(enabled){
        this.communityNameField.enabled = enabled;
        this.firstNameField.enabled = enabled;
        this.lastNameField.enabled = enabled;
        this.emailField.enabled = enabled;
        this.passwordField.enabled = enabled;
        this.confirmPasswordField.enabled = enabled;
        this.submitButton.enabled = enabled;
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