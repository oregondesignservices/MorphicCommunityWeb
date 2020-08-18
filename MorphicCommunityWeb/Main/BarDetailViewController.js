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
// #import "Service.js"
// #import "Community.js"
// #import "Bar.js"
'use strict';

JSClass("BarDetailViewController", UIViewController, {

    service: null,
    community: null,
    bar: null,

    isBarDefault: JSReadOnlyProperty(),

    getIsBarDefault: function(){
        return this.bar !== null && this.bar.id === this.community.defaultBarId;
    },

    // MARK: - View Lifecycle

    viewDidLoad: function(){
        BarDetailViewController.$super.viewDidLoad.call(this);
        this.saveSynchronizer = JSSynchronizer.initWithAction(this.saveBar, this);
        this.saveSynchronizer.pendingInterval = 0;
    },

    viewWillAppear: function(animated){
        BarDetailViewController.$super.viewWillAppear.call(this, animated);
    },

    viewDidAppear: function(animated){
        BarDetailViewController.$super.viewDidAppear.call(this, animated);
        if (this.bar.id !== null){
            // Load the bar's full details
            this.loadBar();
        }else{
            // ...or if this is a new unsaved bar, just show it and focus
            // the name field for editing
            this.update();
            this.view.window.firstResponder = this.nameField;
            this.nameField.selectAll();
        }
    },

    viewWillDisappear: function(animated){
        BarDetailViewController.$super.viewWillDisappear.call(this, animated);
    },

    viewDidDisappear: function(animated){
        BarDetailViewController.$super.viewDidDisappear.call(this, animated);
    },

    detailView: JSOutlet(),
    nameField: JSOutlet(),
    barEditor: JSOutlet(),
    defaultButton: JSOutlet(),
    removeButton: JSOutlet(),

    // MARK: - Loading Data

    loadBar: function(){
        this.showActivityIndicator();
        this.errorView.hidden = true;
        this.service.loadCommunityBar(this.community.id, this.bar.id, function(result, bar){
            this.hideActivityIndicator();
            if (result !== Service.Result.success){
                this.errorView.hidden = false;
                return;
            }
            this.bar = Bar.initWithDictionary(bar);
            this.update();
        }, this);
    },

    activityIndicator: JSOutlet(),
    activityFadeInAnimation: null,

    showActivityIndicator: function(){
        this.activityIndicator.alpha = 0;
        this.activityIndicator.startAnimating();
        this.activityFadeInAnimation = UIViewPropertyAnimator.initWithDuration(0.5);
        var vc = this;
        this.activityFadeInAnimation.addAnimations(function(){
            vc.activityIndicator.alpha = 1;
        });
        this.activityFadeInAnimation.addCompletion(function(){
            vc.activityFadeInAnimation = null;
        });
        this.activityFadeInAnimation.start(2);
    },

    hideActivityIndicator: function(){
        if (this.activityFadeInAnimation !== null){
            this.activityFadeInAnimation.stop();
        }
        this.activityIndicator.stopAnimating();
    },

    update: function(){
        var isDefault = this.bar.id === this.community.defaultBarId;
        this.detailView.hidden = false;
        this.removeButton.hidden = isDefault;
        this.defaultButton.hidden = isDefault || this.bar.id === null;
        this.barEditor.bar = this.bar;
        this.updateCaption();
        this.view.setNeedsLayout();
    },

    updateCaption: function(){
        this.barEditor.captionLabel.text = String.initWithFormat(this.localizedString("preview.caption"), this.bar.name);
    },

    errorView: JSOutlet(),

    // MARK: - Saving Data

    mouseDown: function(){
        if ((this.view.window.firstResponder === this.nameField)){
            this.view.window.firstResponder = null;
        }
    },

    nameEditingEnded: function(){
        if (this.bar.id === null){
            this.saveSynchronizer.sync();
        }
    },

    nameChanged: function(){
        if (this.bar.id !== null){
            this.saveSynchronizer.sync();
        }
        this.updateCaption();
    },

    textFieldDidReceiveEnter: function(textField){
        if (textField === this.nameField){
            this.nameField.window.firstResponder = null;
        }
    },

    textFieldDidChange: function(textField){
        if (textField === this.nameField){
            this.view.setNeedsLayout();
        }
    },

    barEditorDidChange: function(barEditor){
        this.saveSynchronizer.sync();
    },

    barEditorWillOpenItemDetailViewController: function(barEditor, viewController){
        viewController.service = this.service;
        viewController.community = this.community;
    },

    resync: function(){
        if (this.saveSynchronizer.state === JSSynchronizer.State.error){
            this.saveSynchronizer.sync();
        }
    },

    syncIndicator: JSOutlet(),
    saveSynchronizer: null,

    saveBar: function(syncContext){
        if (this.deleted){
            return;
        }
        syncContext.started();
        if (this.bar.id === null){
            this.service.createCommunityBar(this.community.id, this.bar.dictionaryRepresentation(), function(result, response){
                if (result !== Service.Result.success){
                    syncContext.completed(new Error("Request failed"));
                    return;
                }
                var replacedBar = this.bar;
                this.bar = Bar.initWithDictionary(response.bar);
                this.update();
                this.community.addBar(this.bar);
                this.service.notificationCenter.post(Community.Notification.barChanged, this.community, {bar: this.bar, replacedBar: replacedBar});
                syncContext.completed();
            }, this);
        }else{
            this.service.saveCommunityBar(this.community.id, this.bar.dictionaryRepresentation(), function(result){
                if (result !== Service.Result.success){
                    syncContext.completed(new Error("Request failed"));
                    return;
                }
                this.community.updateBar(this.bar);
                this.service.notificationCenter.post(Community.Notification.barChanged, this.community, {bar: this.bar});
                syncContext.completed();
            }, this);
        }
    },

    deleted: false,

    confirmDelete: function(sender){
        var alert = UIAlertController.initWithTitle(null, this.localizedString("deleteConfirmation.message"));
        alert.destructiveButtonStyler = UIButtonDefaultStyler.init();
        alert.destructiveButtonStyler.font = alert.destructiveButtonStyler.font.fontWithPointSize(JSFont.Size.detail).fontWithWeight(JSFont.Weight.bold);
        alert.destructiveButtonStyler.normalTitleColor = JSColor.initWithRGBA(129/255.0, 43/255.0, 0);
        alert.destructiveButtonStyler.activeTitleColor = alert.destructiveButtonStyler.normalTitleColor.colorDarkenedByPercentage(0.2);
        alert.addActionWithTitle(this.localizedString("deleteConfirmation.delete"), UIAlertAction.Style.destructive, function(){
            this.deleteBar();
        }, this);
        alert.addActionWithTitle(this.localizedString("deleteConfirmation.cancel"), UIAlertAction.Style.cancel, function(){
        }, this);
        if (sender instanceof UIView){
            alert.popupAdjacentToView(sender, UIPopupWindow.Placement.below, true);
        }else{
            alert.popupCenteredInView(this.view, true);
        }
    },

    deleteBar: function(){
        if (this.bar.id === null){
            this.deleted = true;
            this.service.notificationCenter.post(Community.Notification.barDeleted, this.community, {bar: this.bar});
            return;
        }
        this.detailView.hidden = true;
        this.showActivityIndicator();
        this.service.deleteCommunityBar(this.community.id, this.bar.id, function(result, response, badRequest){
            this.hideActivityIndicator();
            if (result !== Service.Result.success){
                this.detailView.hidden = false;
                var title;
                var message;
                if (badRequest !== null && badRequest.error === "cannot_delete_used"){
                    title = this.localizedString("deleteError.inUse.title");
                    message = this.localizedString("deleteError.inUse.message");
                }else{
                    title = this.localizedString("deleteError.general.title");
                    message = this.localizedString("deleteError.general.message");
                }
                
                var alert = UIAlertController.initWithTitle(title, message);
                alert.addActionWithTitle(this.localizedString("deleteError.dismiss"), UIAlertAction.Style.cancel, function(){
                }, this);
                alert.popupCenteredInView(this.view, true);
                return;
            }
            this.deleted = true;
            this.community.removeBar(this.bar);
            this.service.notificationCenter.post(Community.Notification.barDeleted, this.community, {bar: this.bar});
        }, this);
    },

    confirmMakeDefault: function(sender){
        var alert = UIAlertController.initWithTitle(null, this.localizedString("defaultConfirmation.message"));
        alert.addActionWithTitle(this.localizedString("defaultConfirmation.delete"), UIAlertAction.Style.default, function(){
            this.makeDefault();
        }, this);
        alert.addActionWithTitle(this.localizedString("defaultConfirmation.cancel"), UIAlertAction.Style.cancel);
        alert.defaultButtonStyler = UIButtonDefaultStyler.init();
        alert.defaultButtonStyler.font = alert.defaultButtonStyler.font.fontWithPointSize(JSFont.Size.detail).fontWithWeight(JSFont.Weight.bold);
        alert.defaultButtonStyler.normalTitleColor = JSColor.initWithRGBA(0, 41/255.0, 87/255.0);
        alert.defaultButtonStyler.activeTitleColor = alert.defaultButtonStyler.normalTitleColor.colorDarkenedByPercentage(0.2);
        if (sender instanceof UIView){
            alert.popupAdjacentToView(sender, UIPopupWindow.Placement.below, true);
        }else{
            alert.popupCenteredInView(this.view, true);
        }
    },

    makeDefault: function(){
        var community = this.community.dictionaryRepresentation();
        community.default_bar_id = this.bar.id;
        this.service.saveCommunity(community, function(result, response){
            if (result !== Service.Result.success){
                var alert = UIAlertController.initWithTitle(this.localizedString("defaultError.general.title"), this.localizedString("defaultError.general.message"));
                alert.addActionWithTitle(this.localizedString("defaultError.dismiss"), UIAlertAction.Style.cancel);
                alert.popupCenteredInView(this.view, true);
                return;
            }
            this.community.defaultBarId = this.bar.id;
            this.service.notificationCenter.post(Community.Notification.defaultBarChanged, this.community);
            this.update();
        }, this);
    },

    // MARK: - Layout

    viewDidLayoutSubviews: function(){
        var bounds = this.view.bounds;
        this.detailView.frame = bounds;
        this.activityIndicator.position = bounds.center;
        this.errorView.sizeToFitSize(JSSize(Math.min(bounds.size.width - 40, 300), Number.MAX_VALUE));
        this.errorView.position = bounds.center;

        bounds = this.detailView.bounds;
        var baseline = 16 + this.nameField.font.displayAscender;
        var buttonSize = this.removeButton.intrinsicSize;
        this.removeButton.frame = JSRect(bounds.size.width - 24 - buttonSize.width + this.removeButton.titleInsets.right, baseline - this.removeButton.firstBaselineOffsetFromTop, buttonSize.width, buttonSize.height);

        buttonSize = this.defaultButton.intrinsicSize;
        this.defaultButton.frame = JSRect(this.removeButton.frame.origin.x - 24 - buttonSize.width + this.defaultButton.titleInsets.right, baseline - this.defaultButton.firstBaselineOffsetFromTop, buttonSize.width, buttonSize.height);

        var x = 24 - this.nameField.textInsets.left;
        var maxNameSize = JSSize(this.defaultButton.frame.origin.x - x - 10, Number.MAX_VALUE);
        this.nameField.sizeToFitText(maxNameSize);
        this.nameField.position = JSPoint(x + this.nameField.bounds.size.width / 2, baseline - this.nameField.firstBaselineOffsetFromTop + this.nameField.bounds.size.height / 2);
        var y = this.nameField.frame.origin.y + this.nameField.frame.size.height + 40;
        this.barEditor.frame = JSRect(24, y, bounds.size.width - 48, bounds.size.height - y - 24);

        var indicatorSize = this.syncIndicator.intrinsicSize;
        this.syncIndicator.frame = JSRect(this.view.bounds.size.width - 5 - indicatorSize.width, 5, indicatorSize.width, indicatorSize.height);
    }

});