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
'use strict';

JSProtocol("PlanUpgradeViewControllerDelegate", JSProtocol, {

    planUpgradeViewDidUpgrade: function(upgradeViewController){},
    planUpgradeViewShowBilling: function(upgradeViewController){},
    planUpgradeViewDidDismiss: function(upgradeViewController){}

});

JSClass("PlanUpgradeViewController", UIViewController, {

    service: null,
    community: null,
    delegate: null,

    // MARK: - View Lifecycle

    viewDidLoad: function(){
        PlanUpgradeViewController.$super.viewDidLoad.call(this);
        this.priceFormatter = JSNumberFormatter.init();
        this.priceFormatter.format = "¤#,##0.##";
        this.priceFormatter.multiplier = 0.01;

        var messageFormat = this.localizedString("messageLabel.format");
        this.messageLabel.text = String.initWithFormat(messageFormat, this.community.memberLimit);
    },

    viewWillAppear: function(animated){
        PlanUpgradeViewController.$super.viewWillAppear.call(this, animated);
    },

    viewDidAppear: function(animated){
        PlanUpgradeViewController.$super.viewDidAppear.call(this, animated);
        this.load();
    },

    viewWillDisappear: function(animated){
        PlanUpgradeViewController.$super.viewWillDisappear.call(this, animated);
    },

    viewDidDisappear: function(animated){
        PlanUpgradeViewController.$super.viewDidDisappear.call(this, animated);
    },

    // MARK: - Loading Data

    plans: null,
    billing: null,
    upgradedPlan: null,

    load: function(){
        this.activityIndicator.startAnimating();
        var remaining = 2;
        var completion = function(){
            --remaining;
            if (remaining === 0){
                this.activityIndicator.stopAnimating();
                this.update();
            }
        };
        this.loadPlans(completion, this);
        this.loadBilling(completion, this);
    },

    loadBilling: function(completion, target){
        this.service.loadCommunityBilling(this.community.id, function(result, billing){
            if (result === Service.Result.success){
                this.billing = Billing.initWithDictionary(billing);
            }
            completion.call(target);
        }, this);
    },

    loadPlans: function(completion, target){
        this.service.loadCommunityPlans(function(result, page){
            if (result === Service.Result.success){
                this.plans = page.plans;
            }
            completion.call(target);
        }, this);
    },

    // MARK: - Views

    priceFormatter: null,
    titleLabel: JSOutlet(),
    messageLabel: JSOutlet(),
    planLabel: JSOutlet(),
    billingButton: JSOutlet(),
    upgradeButton: JSOutlet(),
    activityIndicator: JSOutlet(),
    
    update: function(){
        if (this.billing === null || this.plans === null){
            this.planLabel.text = this.localizedString("plan.error");
        }else{
            var currentPlan = this.findCurrentPlan();
            this.upgradedPlan = this.findUpgradedPlan(currentPlan);
            if (this.upgradedPlan === null){
                this.planLabel.text = this.localizedString("plan.contactSales");
            }else{
                var planFormat = this.localizedString("plan.format");
                var priceString = this.priceFormatter.stringFromNumber(this.upgradedPlan.price / this.upgradedPlan.months);
                this.planLabel.text = String.initWithFormat(planFormat, this.upgradedPlan.member_limit, priceString);
                this.upgradeButton.enabled = true;
            }
        }
    },

    findCurrentPlan: function(){
        var currentPlan = null;
        var plan;
        for (var i = 0, l = this.plans.length; i < l && currentPlan === null; ++i){
            plan = this.plans[i];
            if (plan.id == this.billing.planId){
                currentPlan = plan;
            }
        }
        return currentPlan;
    },

    findUpgradedPlan: function(currentPlan){
        if (currentPlan === null){
            return null;
        }
        var upgradedPlan = null;
        var plan;
        for (var i = 0, l = this.plans.length; i < l; ++i){
            plan = this.plans[i];
            if (plan.months == currentPlan.months && plan.member_limit > currentPlan.member_limit){
                if (upgradedPlan === null || plan.member_limit < upgradedPlan.member_limit){
                    upgradedPlan = plan;
                }
            }
        }
        return upgradedPlan;
    },

    contentSizeThatFitsSize: function(maxSize){
        var size = JSSize.Zero;
        if (maxSize.width < Number.MAX_VALUE){
            size.width = maxSize.width;
        }else{
            size.width = 250;
        }
        var maxLabelSize = JSSize(size.width, Number.MAX_VALUE);
        this.titleLabel.sizeToFitSize(maxLabelSize);
        size.height += this.titleLabel.bounds.size.height;
        this.messageLabel.sizeToFitSize(maxLabelSize);
        size.height += this.messageLabel.bounds.size.height;
        size.height += this.planLabel.maximumNumberOfLines * this.planLabel.font.displayLineHeight + this.planLabel.textInsets.height;
        size.height += this.upgradeButton.intrinsicSize.height;
        return size;
    },

    viewDidLayoutSubviews: function(){
        var y = 0;
        var width = this.view.bounds.size.width;
        var height;
        var maxLabelSize = JSSize(width, Number.MAX_VALUE);

        this.titleLabel.sizeToFitSize(maxLabelSize);
        height = this.titleLabel.bounds.size.height;
        this.titleLabel.frame = JSRect(0, y, width, height);
        y += height;

        this.messageLabel.sizeToFitSize(maxLabelSize);
        height = this.messageLabel.bounds.size.height;
        this.messageLabel.frame = JSRect(0, y, width, height);
        y += height;

        height = this.planLabel.maximumNumberOfLines * this.planLabel.font.displayLineHeight + this.planLabel.textInsets.height;
        this.planLabel.frame = JSRect(0, y, width, height);
        var activitySize = this.planLabel.font.displayLineHeight;
        this.activityIndicator.frame = JSRect((width - activitySize) / 2, y, activitySize, activitySize);
        y += height;

        var buttonWidth = width / 2 - 5;
        this.billingButton.frame = JSRect(0, y, buttonWidth, this.billingButton.intrinsicSize.height);
        this.upgradeButton.frame = JSRect(width - buttonWidth, y, buttonWidth, this.upgradeButton.intrinsicSize.height);
    },

    popupWindow: null,

    popupAdjacentToView: function(view, placement, animated){
        this.popupWindow = PlanUpgradePopupWindow.init();
        this.popupWindow.contentViewController = this;
        view.window.modal = this.popupWindow;
        this.popupWindow.openAdjacentToView(view, placement, animated);
    },

    dismiss: function(){
        if (this.popupWindow !== null){
            this.popupWindow.close();
        }
        if (this.delegate && this.delegate.planUpgradeViewDidDismiss){
            this.delegate.planUpgradeViewDidDismiss(this);
        }
    },

    // MARK: - Actions

    showBilling: function(){
        if (this.delegate && this.delegate.planUpgradeViewShowBilling){
            this.delegate.planUpgradeViewShowBilling(this);
            this.dismiss();
        }
    },

    upgrade: function(){
        this.upgradeButton.enabled = false;
        this.popupWindow.escapeClosesWindow = false;
        this.popupWindow.canClose = false;
        this.popupWindow.escapeClosesWindow = false;
        this.billing.planId = this.upgradedPlan.id;
        this.service.saveCommunityBilling(this.community.id, this.billing.dictionaryRepresentation(), function(result){
            this.popupWindow.canClose = true;
            this.popupWindow.escapeClosesWindow = true;
            if (result !== Service.Result.success){
                this.upgradeButton.enabled = true;
                this.showUpgradeError();
                return;
            }
            this.community.memberLimit = this.upgradedPlan.member_limit;
            if (this.delegate && this.delegate.planUpgradeViewDidUpgrade){
                this.delegate.planUpgradeViewDidUpgrade(this);
                this.dismiss();
            }
        }, this);
    },

    showUpgradeError: function(){
        var alert = UIAlertController.initWithTitle(this.localizedString("upgradeError.title"), this.localizedString("upgradeError.message"));
        alert.addActionWithTitle(this.localizedString("upgradeError.dismiss.title"), UIAlertAction.Style.cancel);
        alert.showCenteredInView(this.window);
    }

});

JSClass("PlanUpgradePopupWindow", UIPopupWindow, {

    escapeClosesWindow: true,
    canClose: true,

    indicateModalStatus: function(){
        if (this.canClose){
            this.contentViewController.dismiss();
        }else{
            PlanUpgradePopupWindow.$super.indicateModalStatus.call(this);
        }
    },

    keyDown: function(event){
        if (this.canClose && this.escapeClosesWindow && event.key == UIEvent.Key.escape){
            this.contentViewController.dismiss();
        }else{
            PlanUpgradePopupWindow.$super.keyDown.call(this, event);
        }
    },

});