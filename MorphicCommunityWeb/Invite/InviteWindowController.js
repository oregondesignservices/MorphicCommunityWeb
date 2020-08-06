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
// #import "Invitation.js"
// #import "Member.js"
'use strict';

JSClass("InviteWindowController", UIWindowController, {

    service: null,
    community: null,
    member: null,
    invitation: null,

    viewDidLoad: function(){
        InviteWindowController.$super.viewDidLoad.call(this);
        this.invitation = Invitation.init();
        this.invitation.memberId = this.member.id;
    },

    viewDidAppear: function(animated){
        InviteWindowController.$super.viewDidAppear.call(this, animated);
        this.window.firstResponder = this.toField;
    },

    formView: JSOutlet(),
    toField: JSOutlet(),
    messageField: JSOutlet(),

    contentSizeThatFitsSize: function(maxSize){
        var size = JSSize.Zero;
        if (maxSize.width < Number.MAX_VALUE){
            size.width = maxSize.width;
        }else{
            size.width = 600;
        }
        size.height += this.formView.intrinsicSize.height;
        size.height += 400;
        return size;
    },

    viewDidLayoutSubviews: function(){
        this.formView.frame = JSRect(0, 0, this.window.contentView.bounds.size.width, this.formView.intrinsicSize.height);
        var y = this.formView.bounds.size.height;
        this.messageField.frame = JSRect(0, y, this.window.contentView.bounds.size.width, this.window.contentView.bounds.size.height - y);
    },

    canPerformAction: function(action, sender){
        if (action === "send"){
            return !!this.invitation.toEmail;
        }
        return InviteWindowController.$super.canPerformAction.call(this, action, sender);
    },

    send: function(){
        this.service.sendCommunityInvitation(this.community.id, this.invitation.dictionaryRepresentation(), function(result, _, badRequest){
            if (result === Service.Result.badRequest){
                if (badRequest.error === "malformed_email"){
                    this.showErrorMessageForField(JSBundle.mainBundle.localizedString("errors.invalidEmail.message", "InviteWindowController"), this.toField);
                    return;   
                }
            }
            if (result !== Service.Result.success){
                this.showGeneralError();
                return;
            }
            this.member.state = Member.State.invited;
            this.close();
        }, this);
    },

    showGeneralError: function(){
        var title = JSBundle.mainBundle.localizedString("errors.general.title", "InviteWindowController");
        var message = JSBundle.mainBundle.localizedString("errors.general.message", "InviteWindowController");
        var alert = UIAlertController.initWithTitle(title, message);
        alert.addActionWithTitle(JSBundle.mainBundle.localizedString("errors.dismiss", "InviteWindowController"), UIAlertAction.Style.cancel);
        alert.popupCenteredInView(this.view, true);
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

    textFieldDidChange: function(textField){
        if (this.errorPopupWindow && textField === this.errorField){
            this.clearFieldErrorMessage();
        }
    },
});