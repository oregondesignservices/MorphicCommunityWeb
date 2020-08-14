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
// #import "CommunityBillingPlanView.js"
// #import "CommunityBillingCardField.js"
// #import "CommunityBillingCardWindowController.js"
'use strict';

JSClass("CommunityBillingSettingsViewController", UIViewController, {

    community: null,
    service: null,

    // MARK: - View Lifecycle

    viewDidLoad: function(){
        CommunityBillingSettingsViewController.$super.viewDidLoad.call(this);
        this.billingSaveSynchronizer = JSSynchronizer.initWithAction(this.saveBilling, this);
        this.billingSaveSynchronizer.pendingInterval = 0;
        this.priceFormatter = JSNumberFormatter.init();
        this.priceFormatter.format = "¤#,##0.##";
        this.priceFormatter.multiplier = 0.01;
    },

    viewWillAppear: function(animated){
        CommunityBillingSettingsViewController.$super.viewWillAppear.call(this, animated);
        this.load();
    },

    viewDidAppear: function(animated){
        CommunityBillingSettingsViewController.$super.viewDidAppear.call(this, animated);
        this.view.window.addSubview(this.syncIndicator);
        this.syncIndicator.frame = this.view.window.viewController.syncIndicator.frame;
    },

    viewWillDisappear: function(animated){
        CommunityBillingSettingsViewController.$super.viewWillDisappear.call(this, animated);
        this.syncIndicator.removeFromSuperview();
        if (this.cardWindowController !== null){
            this.cardWindowController.close();
        }
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
        this.populatePlans();
        this.populateContactPopupMenu();
        this.updateCardField();
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
                    var format = JSBundle.mainBundle.localizedString("trial.days.format", "CommunityBillingSettingsViewController");
                    this.trialStatusLabel.text = String.initWithFormat(format, days);
                }
            }
        }else{
            this.trialStatusLabel.hidden = true;
            this.paymentErrorLabel.hidden = false;
        }
        this.scrollView.hidden = false;
        this.formView.setNeedsLayout();
        this.view.setNeedsLayout();
    },

    updateCardField: function(){
        if (this.billing.card !== null){
            var format = JSBundle.mainBundle.localizedString("card.format", "CommunityBillingSettingsViewController");
            this.cardValueLabel.text = String.initWithFormat(format, this.billing.card.brand, this.billing.card.last4);
            this.cardValueButton.titleLabel.text = JSBundle.mainBundle.localizedString("changeCard.title", "CommunityBillingSettingsViewController");
        }else{
            this.cardValueLabel.text = JSBundle.mainBundle.localizedString("noCard.text", "CommunityBillingSettingsViewController");
            this.cardValueButton.titleLabel.text = JSBundle.mainBundle.localizedString("addCard.title", "CommunityBillingSettingsViewController");
        }
        this.cardValueView.setNeedsLayout();
        this.formView.setNeedsLayout();
    },

    planGroups: null,

    populatePlans: function(){
        // The list of plans from the server is a flat list like
        // - 5 members, billed monthly
        // - 5 members, billed every 6 months
        // - 15 members, billed monthly
        // - 15 members, billed every 6 months
        // - 50 members, billed monthly
        //
        // For such a case, we want to show 3 boxes, one for each number of
        // members.  Each box will contain the prices for both billing periods

        // 1. Group the plans by their number of members
        var plansByMembers = {};
        var plan;
        var i, l;
        for (i = 0, l = this.plans.length; i < l; ++i){
            plan = this.plans[i];
            if (!plansByMembers[plan.member_limit]){
                plansByMembers[plan.member_limit] = [];
            }
            plansByMembers[plan.member_limit].push(plan);
        }

        // 2. Get an array of grouped plans, sorted from lowest member count to highest
        this.planGroups = [];
        for (var x in plansByMembers){
            this.planGroups.push(plansByMembers[x]);
        }
        this.planGroups.sort(function(a, b){
            return a[0].member_limit - b[0].member_limit;
        });

        // 3. Create the boxes
        var comparePlans = function(a, b){
            return a.price / a.months - b.price / b.months;
        };
        var membersFormat = JSBundle.mainBundle.localizedString("plans.names.members.format", "CommunityBillingSettingsViewController");
        var billingPeriodFormat = JSBundle.mainBundle.localizedString("plans.period.months.format", "CommunityBillingSettingsViewController");
        var billingPeriodString = function(months){
            if (months === 1){
                return JSBundle.mainBundle.localizedString("plans.period.monthly", "CommunityBillingSettingsViewController");
            }
            if (months === 12){
                return JSBundle.mainBundle.localizedString("plans.period.annually", "CommunityBillingSettingsViewController");
            }
            return String.initWithFormat(billingPeriodFormat, months);
        };
        var plans;
        var planView;
        var priceString;
        var priceFormat = JSBundle.mainBundle.localizedString("plans.price.format", "CommunityBillingSettingsViewController");
        var attributedPrice;
        for (i = 0, l = this.planGroups.length; i < l; ++i){
            plans = this.planGroups[i];
            plans.sort(comparePlans);
            plan = plans[0];
            planView = CommunityBillingPlanView.init();
            planView.index = i;
            planView.addAction(this.planSelected, this);
            if (plan.member_limit === 0){
                planView.nameLabel = JSBundle.mainBundle.localizedString("plans.names.unlimited", "CommunityBillingSettingsViewController");
                planView.enabled = true;
            }else{
                planView.nameLabel.text = String.initWithFormat(membersFormat, plan.member_limit);
                planView.enabled = plan.member_limit >= this.community.memberCount;
            }
            priceString = this.priceFormatter.stringFromNumber(plan.price / plan.months);
            attributedPrice = JSAttributedString.initWithString(priceFormat, {font: JSFont.systemFontOfSize(JSFont.Size.detail)});
            attributedPrice.replaceFormat(priceString, {font: planView.priceLabel.font});
            planView.priceLabel.attributedText = attributedPrice;
            planView.periodLabel.text = billingPeriodString(plan.months);
            if (plans.length > 1){
                plan = plans[1];
                priceString = this.priceFormatter.stringFromNumber(plan.price / plan.months);
                planView.secondaryPriceLabel.text = String.initWithFormat(priceFormat, priceString);
                planView.secondaryPeriodLabel.text = billingPeriodString(plan.months);
            }else{
                planView.secondaryPriceLabel.text = "";
                planView.secondaryPeriodLabel.text = "";
            }
            this.plansView.addSubview(planView);
        }
        this.updatePlanSelection();
    },

    updatePlanSelection: function(){
        var plans;
        var plan;
        var planView;
        for (var i = 0, l = this.planGroups.length; i < l; ++i){
            plans = this.planGroups[i];
            planView = this.plansView.subviews[i];
            planView.selected = false;
            for (var j = 0, k = plans.length; j < k; ++j){
                plan = plans[j];
                if (plan.id == this.billing.planId){
                    planView.selected = true;
                }
            }
        }
    },

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

    // Views

    syncIndicator: JSOutlet(),
    errorView: JSOutlet(),
    scrollView: JSOutlet(),
    plansView: JSOutlet(),
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

        this.plansView.frame = JSRect(origin, JSSize(maxContentSize.width, 140));
        origin.y += this.plansView.bounds.size.height + 20;

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

    contactChanged: function(){
        var contact = this.contacts[this.contactPopupButton.selectedIndex];
        this.billing.contactMemberId = contact.id;
        this.billingSaveSynchronizer.sync();
    },

    cardWindowController: null,

    changeCard: function(sender){
        if (this.cardWindowController === null){
            this.cardWindowController = CommunityBillingCardWindowController.initWithSpecName("CommunityBillingCardWindowController");
            this.cardWindowController.delegate = this;
            this.cardWindowController.service = this.service;
            this.cardWindowController.community = this.community;
            this.cardWindowController.billing = this.billing;
        }
        this.cardWindowController.makeKeyAndOrderFront();
    },

    windowControllerDidClose: function(controller){
        if (controller === this.cardWindowController){
            this.cardWindowController = null;
            this.updateCardField();
        }
    },

    planSelected: function(sender){
        var plans = this.planGroups[sender.index];
        var alert = UIAlertController.initWithTitle(sender.nameLabel.text, JSBundle.mainBundle.localizedString("plans.changeConfirmation.title", "CommunityBillingSettingsViewController"));
        var plan;
        var action;
        for (var i = 0, l = plans.length; i < l; ++i){
            plan = plans[i];
            action = this.createAlertActionForChangingToPlan(plan);
            alert.addAction(action);
        }
        alert.addActionWithTitle(JSBundle.mainBundle.localizedString("plans.changeConfirmation.cancel.title", "CommunityBillingSettingsViewController"), UIAlertAction.Style.cancel);
        alert.popupAdjacentToView(sender, UIPopupWindow.Placement.below);
    },

    createAlertActionForChangingToPlan: function(plan){
        var format;
        var title;
        var priceString = this.priceFormatter.stringFromNumber(plan.price / plan.months);
        if (plan.months === 1){
            format = JSBundle.mainBundle.localizedString("plans.changeConfirmation.plan.monthly.format", "CommunityBillingSettingsViewController");
            title = String.initWithFormat(format, priceString);
        }else if (plan.months === 12){
            format = JSBundle.mainBundle.localizedString("plans.changeConfirmation.plan.annually.format", "CommunityBillingSettingsViewController");
            title = String.initWithFormat(format, priceString);
        }else{
            format = JSBundle.mainBundle.localizedString("plans.changeConfirmation.plan.months.format", "CommunityBillingSettingsViewController");
            title = String.initWithFormat(format, priceString, plan.months);
        }
        var action = UIAlertAction.initWithTitle(title, UIAlertAction.Style.normal, function(){
            this.changeToPlan(plan);
        }, this);
        return action;
    },

    changeToPlan: function(plan){
        this.billing.planId = plan.id;
        this.updatePlanSelection();
        this.billingSaveSynchronizer.sync();
        this.community.memberLimit = plan.member_limit;
    },

    priceFormatter: null,

    // MARK: - Saving Data

    billingSaveSynchronizer: null,

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