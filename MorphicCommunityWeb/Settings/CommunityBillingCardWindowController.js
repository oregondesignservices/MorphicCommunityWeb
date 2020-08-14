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
// #import "BillingCard.js"
'use strict';

JSClass("CommunityBillingCardWindowController", UIWindowController, {

    service: null,
    community: null,
    billing: null,

    // MARK: - View Lifecycle

    viewDidLoad: function(){
        CommunityBillingCardWindowController.$super.viewDidLoad.call(this);
    },

    viewWillAppear: function(animated){
        CommunityBillingCardWindowController.$super.viewWillAppear.call(this, animated);
    },

    hasAppeared: false,

    viewDidAppear: function(animated){
        CommunityBillingCardWindowController.$super.viewDidAppear.call(this, animated);
        if (!this.hasAppeared){
            this.hasAppeared = true;
            this.cardField.receiveKeyInputWhenReady();
        }
    },

    viewWillDisappear: function(animated){
        CommunityBillingCardWindowController.$super.viewWillDisappear.call(this, animated);
    },

    viewDidDisappear: function(animated){
        CommunityBillingCardWindowController.$super.viewDidDisappear.call(this, animated);
    },

    // MARK: - Views

    cardField: JSOutlet(),
    saveButton: JSOutlet(),
    activityIndicator: JSOutlet(),

    contentInsets: JSInsets(10, 20, 20, 20),
    fieldSpacing: 7,

    contentSizeThatFitsSize: function(maxSize){
        var size = JSSize(maxSize.width, this.contentInsets.height);
        if (size.width == Number.MAX_VALUE){
            size.width = 300;
        }
        size.height += this.cardField.intrinsicSize.height;
        size.height += this.fieldSpacing;
        size.height += this.saveButton.intrinsicSize.height;
        return size;
    },

    viewDidLayoutSubviews: function(){
        var origin = JSPoint(this.contentInsets.left, this.contentInsets.top);
        var maxContentSize = JSSize(this.view.bounds.size.width - this.contentInsets.width, Number.MAX_VALUE);
        this.cardField.frame = JSRect(origin, JSSize(maxContentSize.width, this.cardField.intrinsicSize.height));
        origin.y += this.cardField.bounds.size.height;
        origin.y += this.fieldSpacing;
        this.saveButton.frame = JSRect(origin, JSSize(maxContentSize.width, this.saveButton.intrinsicSize.height));
        var activitySize = this.saveButton.frame.size.height - this.saveButton.titleInsets.height;
        this.activityIndicator.bounds = JSRect(0, 0, activitySize, activitySize);
        this.activityIndicator.position = this.saveButton.bounds.center;
    },

    cardChanged: function(){
        this.saveButton.enabled = this.cardField.valid;
        this.clearCardError();
    },

    showActivityAnimator: null,

    save: function(){
        this.clearCardError();
        this.window.allowsClose = false;
        this.saveButton.enabled = false;
        this.cardField.enabled = false;
        this.showActivityAnimator = UIViewPropertyAnimator.initWithDuration(0.5);
        this.activityIndicator.startAnimating();
        this.activityIndicator.alpha = 0;
        this.showActivityAnimator.addAnimations(function(){
            this.activityIndicator.alpha = 1;
            this.saveButton.titleLabel.alpha = 0;
        }, this);
        this.showActivityAnimator.addCompletion(function(){
            this.showActivityAnimator = null;
        }, this);
        this.showActivityAnimator.start();
        this.cardField.createStripeToken(function(error, token){
            if (error !== null){
                this.resetSaveActivity();
                this.showCardError(JSBundle.mainBundle.localizedString("cardError.generic", "CommunityBillingCardWindowController"));
                return;
            }
            this.service.updateCommunityBillingCard(this.community.id, token.id, function(result, response){
                if (result == Service.Result.badRequest){
                    this.resetSaveActivity();
                    this.showCardError(JSBundle.mainBundle.localizedString("cardError.generic", "CommunityBillingCardWindowController"));
                    return;
                }
                if (result != Service.Result.success){
                    this.resetSaveActivity();
                    this.showGenericError();
                    return;
                }
                this.billing.card = BillingCard.initWithDictionary(response.card);
                this.close();
            }, this);
        }, this);
    },

    resetSaveActivity: function(){
        this.window.allowsClose = true;
        this.saveButton.enabled = true;
        this.cardField.enabled = true;
        this.activityIndicator.stopAnimating();
        if (this.showActivityAnimator !== null){
            this.showActivityAnimator.stop();
        }
        this.saveButton.titleLabel.alpha = 1;
    },

    errorPopupWindow: null,

    showCardError: function(message){
        this.clearCardError();
        var label = UILabel.init();
        label.text = message;
        this.errorPopupWindow = UIPopupWindow.init();
        this.errorPopupWindow.canBecomeKey = false;
        this.errorPopupWindow.contentView = label;
        this.errorPopupWindow.openAdjacentToView(this.cardField, UIPopupWindow.Placement.right);
    },

    clearCardError: function(){
        if (this.errorPopupWindow !== null){
            this.errorPopupWindow.close();
            this.errorPopupWindow = null;
        }
    },

    showGenericError: function(){
        var title = JSBundle.mainBundle.localizedString("cardError.generic.title", "CommunityBillingCardWindowController");
        var message = JSBundle.mainBundle.localizedString("cardError.generic.message", "CommunityBillingCardWindowController");
        var alert = UIAlertController.initWithTitle(title, message);
        var dismissTitle = JSBundle.mainBundle.localizedString("cardError.generic.dismiss.title", "CommunityBillingCardWindowController");
        alert.addActionWithTitle(dismissTitle, UIAlertAction.Style.cancel);
        alert.popupCenteredInView(this.view.window);
    },

});