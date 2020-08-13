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
// #import "Billing.js"
// #import "Member.js"
'use strict';

JSClass("CommunityBillingSettingsViewController", UIViewController, {

    community: null,
    service: null,

    // MARK: - View Lifecycle

    viewDidLoad: function(){
        CommunityBillingSettingsViewController.$super.viewDidLoad.call(this);
        this.billingSaveSynchronizer = JSSynchronizer.initWithAction(this.saveBilling, this);
        this.billingSaveSynchronizer.pendingInterval = 0;
    },

    viewWillAppear: function(animated){
        CommunityBillingSettingsViewController.$super.viewWillAppear.call(this, animated);
        this.load();
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

    // MARK: - Loading Data

    plans: null,
    billing: null,

    load: function(){
        var remaining = 2;
        var completion = function(){
            --remaining;
            if (remaining === 0){
                this.update();
            }
        };
        this.loadPlans(completion, this);
        this.loadBilling(completion, this);
    },

    loadBilling: function(completion, target){
        this.service.loadCommunityBilling(this.community.id, function(result, billing){
            if (result != Service.Result.success){
                this.errorView.hidden = false;
                return;
            }
            this.billing = Billing.initWithDictionary(billing);
            completion.call(target);
        }, this);
    },

    loadPlans: function(completion, target){
        this.service.loadCommunityPlans(function(result, page){
            if (result != Service.Result.success){
                this.errorView.hidden = false;
                return;
            }
            this.plans = page.plans;
            completion.call(target);
        }, this);
    },

    update: function(){
        var format;
        this.populateContactPopupMenu();
        if (this.billing.card !== null){
            format = JSBundle.mainBundle.localizedString("card.format", "CommunityBillingSettingsViewController");
            this.cardValueLabel.text = String.initWithFormat(format, this.billing.card.brand, this.billing.card.last4);
            this.cardValueButton.titleLabel.text = JSBundle.mainBundle.localizedString("changeCard.title", "CommunityBillingSettingsViewController");
        }else{
            this.cardValueLabel.text = JSBundle.mainBundle.localizedString("noCard.text", "CommunityBillingSettingsViewController");
            this.cardValueButton.titleLabel.text = JSBundle.mainBundle.localizedString("addCard.title", "CommunityBillingSettingsViewController");
        }

        if (this.billing.status == Billing.Status.paid){
            this.paymentErrorLabel.hidden = true;
            if (this.billing.trialEndDate.isPast()){
                this.trialStatusLabel.hidden = true;
            }else{
                this.trialStatusLabel.hidden = false;
                var days = this.billing.daysUntilTrialEnd();
                if (days === 0){
                    this.trialStatusLabel.text = JSBundle.mainBundle.localizedString("trial.today.text", "CommunityBillingSettingsViewController");
                }else if (days === 1){
                    this.trialStatusLabel.text = JSBundle.mainBundle.localizedString("trial.tomorrow.text", "CommunityBillingSettingsViewController");
                }else{
                    format = JSBundle.mainBundle.localizedString("trial.days.format", "CommunityBillingSettingsViewController");
                    this.trialStatusLabel.text = String.initWithFormat(format, days);
                }
            }
        }else{
            this.trialStatusLabel.hidden = true;
            this.paymentErrorLabel.hidden = false;
        }
        this.cardValueView.setNeedsLayout();
        this.scrollView.hidden = false;
        this.formView.setNeedsLayout();
        this.view.setNeedsLayout();
    },

    // Views

    errorView: JSOutlet(),
    scrollView: JSOutlet(),
    trialStatusLabel: JSOutlet(),
    paymentErrorLabel: JSOutlet(),
    formView: JSOutlet(),
    contactPopupButton: JSOutlet(),
    cardValueView: JSOutlet(),
    cardValueLabel: JSOutlet(),
    cardValueButton: JSOutlet(),

    viewDidLayoutSubviews: function(){
        this.scrollView.frame = this.view.bounds;
        var insets = JSInsets(20);
        var scrollContentSize = JSSize(this.view.bounds.size.width, 0);
        var maxContentSize = JSSize(scrollContentSize.width - insets.width, Number.MAX_VALUE);
        var origin = JSPoint(insets.left, insets.top);

        this.errorView.sizeToFitSize(maxContentSize);
        this.errorView.position = this.view.bounds.center;

        if (!this.trialStatusLabel.hidden){
            this.trialStatusLabel.sizeToFitSize(maxContentSize);
            this.trialStatusLabel.frame = JSRect(origin, JSSize(maxContentSize.width, this.trialStatusLabel.bounds.size.height));
            origin.y += this.trialStatusLabel.bounds.size.height;
        }

        if (!this.paymentErrorLabel.hidden){
            this.paymentErrorLabel.sizeToFitSize(maxContentSize);
            this.paymentErrorLabel.frame = JSRect(origin, JSSize(maxContentSize.width, this.paymentErrorLabel.bounds.size.height));
            origin.y += this.paymentErrorLabel.bounds.size.height;
        }

        this.formView.frame = JSRect(origin, JSSize(maxContentSize.width, this.formView.intrinsicSize.height));
        origin.y += this.formView.frame.size.height;
        // this.subscribeButton.sizeToFit();
        // this.subscribeButton.frame = JSRect(this.view.bounds.size.width - insets.right - this.subscribeButton.bounds.size.width, insets.top, this.subscribeButton.bounds.size.width, this.subscribeButton.bounds.size.height);
        // var right = this.subscribeButton.frame.origin.x - 7;
        // this.creditCardField.frame = JSRect(insets.left, this.subscribeButton.frame.origin.y + this.subscribeButton.firstBaselineOffsetFromTop - this.creditCardField.firstBaselineOffsetFromTop, right - insets.left, this.creditCardField.intrinsicSize.height);

        scrollContentSize.height = origin.y + insets.bottom;
        this.scrollView.scrollContentSize = scrollContentSize;
    },

    subscribe: function(){
        this.setFieldsEnabled(false);
        this.subscribeButton.createStripeToken(function(error, token){
            if (error !== null){
                this.setFieldsEnabled(true);
                // error.type
                // - api_connection_error
                // - api_error
                // - authentication_error
                // - card_error
                // - idempotency_error
                // - invalid_request_error
                // - rate_limit_error
                // error.code
                // - card_decline_rate_limit_exceeded
                // - card_declined
                // - expired_card
                // - incorrect_address
                // - incorrect_cvc
                // - incorrect_number
                // - incorrect_zip
                // - invalid_card_type
                // - invalid_characters
                // - invalid_cvc
                // - invalid_expiry_month
                // - invalid_expiry_year
                // - invalid_number
                // - postal_code_invalid
                // - processing_error
                // error.decline_code
                // 
                // TODO: show credit card error message
                return;
            }
        }, this);
    },

    setFieldsEnabled: function(enabled){
        this.creditCardField.enabled = enabled;
        this.subscribeButton.enabled = enabled;
    },

    contactChanged: function(){
        var contact = this.contacts[this.contactPopupButton.selectedIndex];
        this.billing.contactMemberId = contact.id;
        this.billingSaveSynchronizer.sync();
    },

    changeCard: function(sender){

    },

    // MARK: - Saving Data

    billingSaveSynchronizer: null,

    contacts: null,

    populateContactPopupMenu: function(){
        this.contacts = [];
        var member;
        for (var i = 0, l = this.community.members.length; i < l; ++i){
            member = this.community.members[i];
            if (member.role == Member.Role.manager && member.state == Member.State.active){
                this.contacts.push(member);
                this.contactPopupButton.addItemWithTitle(member.fullName);
                if (member.id == this.billing.contactMemberId){
                    this.contactPopupButton.selectedIndex = this.contacts.length - 1;
                }
            }
        }
    },

    saveBilling: function(syncContext){
        syncContext.started();
        this.service.saveCommunityBilling(this.community.id, this.billing.dictionaryRepresentation(), function(result){
            if (result != Service.Result.success){
                syncContext.completed(new Error("Request failed"));
                return;
            }
            syncContext.completed();
        }, this);
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

JSClass("CommunityBillingCardField", UIView, {

    initWithSpec: function(spec){
        CommunityBillingCardField.$super.initWithSpec.call(this, spec);
        if (spec.containsKey("label")){
            this.label = spec.valueForKey("label");
            this.addSubview(this.label);
        }
        if (spec.containsKey("button")){
            this.button = spec.valueForKey("button");
            this.addSubview(this.button);
        }
    },

    label: null,
    button: null,

    getIntrinsicSize: function(){
        return JSSize(UIView.noIntrinsicSize, this.button.intrinsicSize.height);
    },

    layoutSubviews: function(){
        this.button.sizeToFit();
        this.button.frame = JSRect(JSPoint(this.bounds.size.width - this.button.bounds.size.width, 0), this.button.bounds.size);
        this.label.frame = JSRect(0, this.button.firstBaselineOffsetFromTop - this.label.firstBaselineOffsetFromTop, this.button.frame.origin.x, this.label.intrinsicSize.height);
    },

    getFirstBaselineOffsetFromTop: function(){
        return this.button.firstBaselineOffsetFromTop;
    }

});