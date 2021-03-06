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
// #import "Member.js"
// #import "InviteWindowController.js"
'use strict';
JSClass("MemberDetailViewController", UIViewController, {

    service: null,
    community: null,
    member: null,
    bar: null,

    // MARK: - View Lifecycle

    viewDidLoad: function(){
        MemberDetailViewController.$super.viewDidLoad.call(this);
        this.memberSaveSynchronizer = JSSynchronizer.initWithAction(this.saveMember, this);
        this.memberSaveSynchronizer.addObserverForKeyPath(this, "state");
        this.memberSaveSynchronizer.pendingInterval = 0;
        this.barSaveSynchronizer = JSSynchronizer.initWithAction(this.saveBar, this);
        this.barSaveSynchronizer.addObserverForKeyPath(this, "state");
        this.barSaveSynchronizer.pendingInterval = 0;
    },

    viewWillAppear: function(animated){
        MemberDetailViewController.$super.viewWillAppear.call(this, animated);
    },

    viewDidAppear: function(animated){
        MemberDetailViewController.$super.viewDidAppear.call(this, animated);
        if (this.member.id !== null){
            // Load the full details for this member
            this.loadMember();
        }else{
            // ... or if we have a new unsaved member, just show it and
            // focus on the first name field
            this.update();
            this.view.window.firstResponder = this.firstNameField;
            this.firstNameField.selectAll();
            this.loadBar();
        }
    },

    viewWillDisappear: function(animated){
        MemberDetailViewController.$super.viewWillDisappear.call(this, animated);
        this.closeWindows();
    },

    viewDidDisappear: function(animated){
        MemberDetailViewController.$super.viewDidDisappear.call(this, animated);
    },

    detailView: JSOutlet(),
    firstNameField: JSOutlet(),
    lastNameField: JSOutlet(),
    removeButton: JSOutlet(),
    stateIndicator: JSOutlet(),
    stateLabel: JSOutlet(),
    sendInvitationButton: JSOutlet(),
    barLabel: JSOutlet(),
    barPopupButton: JSOutlet(),
    barEditor: JSOutlet(),

    // MARK: - Observers

    observeValueForKeyPath: function(keyPath, ofObject, change, context){
        if (ofObject === this.memberSaveSynchronizer || ofObject === this.barSaveSynchronizer){
            this.updateCombinedSyncState();
        }
    },

    // MARK: - Loading Data

    loadMember: function(){
        this.showActivityIndicator();
        this.errorView.hidden = true;
        this.service.loadCommunityMember(this.community.id, this.member.id, function(result, member){
            this.hideActivityIndicator();
            if (result !== Service.Result.success){
                this.errorView.hidden = false;
                return;
            }
            this.member = Member.initWithDictionary(member);
            this.update();
            this.loadBar();
        }, this);
    },

    loadBar: function(){
        this.showBarLoading();
        var loadingBarId = this.member.barId || this.community.defaultBarId;
        this.service.loadCommunityBar(this.community.id, loadingBarId, function(result, bar){
            var latestMemberBarId = this.member.barId || this.community.defaultBarId;
            if (latestMemberBarId != loadingBarId){
                return;
            }
            this.hideBarLoading();
            if (result !== Service.Result.success){
                this.barEditor.hidden = true;
                return;
            }
            this.bar = Bar.initWithDictionary(bar);
            this.barEditor.bar = this.bar;
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

    barLoadingView: JSOutlet(),
    barLoadingActivityIndicator: JSOutlet(),
    barLoadingFadeInAnimation: null,

    showBarLoading: function(){
        this.barLoadingView.hidden = false;
        this.barLoadingView.alpha = 0;
        this.barLoadingActivityIndicator.startAnimating();
        this.barLoadingFadeInAnimation = UIViewPropertyAnimator.initWithDuration(0.5);
        var vc = this;
        this.barLoadingFadeInAnimation.addAnimations(function(){
            vc.barLoadingView.alpha = 1;
        });
        this.barLoadingFadeInAnimation.addCompletion(function(){
            vc.barLoadingFadeInAnimation = null;
        });
        this.barLoadingFadeInAnimation.start(1);
    },

    hideBarLoading: function(){
        if (this.barLoadingFadeInAnimation !== null){
            this.barLoadingFadeInAnimation.stop();
        }
        this.barLoadingActivityIndicator.stopAnimating();
        this.barLoadingView.hidden = true;
    },

    update: function(){
        this.detailView.hidden = false;
        this.updateBarLabel();
        this.updateBarMenu();
        this.updateInviteButton();
        this.updateCaption();
        this.view.setNeedsLayout();
    },

    updateBarLabel: function(){
        var format = this.localizedString("barLabel.textFormat");
        this.barLabel.text = String.initWithFormat(format, this.member.firstName || this.member.lastName || this.member.placeholderName);
    },

    updateBarMenu: function(){
        var defaultBar;
        var bars = [];
        var bar;
        var i, l;
        var selectedTag = null;
        var memberBarId = this.member.barId || this.community.defaultBarId;
        var tag;
        for (i = 0, l = this.community.bars.length; i < l; ++i){
            bar = this.community.bars[i];
            if (bar.id === this.community.defaultBarId){
                tag = "__default__";
                defaultBar = bar;
            }else if (!bar.shared){
                tag = "__custom__";
            }else{
                tag = bar.id;
                bars.push(bar);
            }
            if (bar.id === memberBarId){
                selectedTag = tag;
            }
        }
        bars.sort(function(a, b){
            return a.name.localeCompare(b.name);
        });
        this.barPopupButton.removeAllItems();
        var defaultFormat = this.localizedString("barPopupButton.defaultFormat");
        this.barPopupButton.addItemWithTitle(String.initWithFormat(defaultFormat, defaultBar.name), "__default__");
        for (i = 0, l = bars.length; i < l; ++i){
            bar = bars[i];
            this.barPopupButton.addItemWithTitle(bar.name, bar.id);
        }
        this.barPopupButton.addItemWithTitle(this.localizedString("barPopupButton.custom"), "__custom__");
        this.barPopupButton.selectedTag = selectedTag;
    },

    updateInviteButton: function(){
        switch (this.member.state){
            case Member.State.uninvited:
                this.sendInvitationButton.hidden = false;
                break;
            case Member.State.invited:
                this.sendInvitationButton.hidden = false;
                this.sendInvitationButton.titleLabel.text = this.localizedString("resendInviteButton.title");
                break;
            case Member.State.active:
                this.sendInvitationButton.hidden = true;
                break;
        }
    },

    updateCaption: function(){
        if (this.member.firstName){
            this.barEditor.captionLabel.text = String.initWithFormat(this.localizedString("preview.caption"), this.member.firstName);
        }else{
            this.barEditor.captionLabel.text = this.localizedString("preview.unnamedCaption");
        }
    },

    errorView: JSOutlet(),

    // MARK: - Saving Data

    mouseDown: function(){
        if ((this.view.window.firstResponder === this.firstNameField) || (this.view.window.firstResponder === this.lastNameField)){
            this.view.window.firstResponder = null;
        }
    },

    firstNameEditingEnded: function(){
        if (this.member.id === null){
            this.memberSaveSynchronizer.sync();
        }
    },

    firstNameChanged: function(){
        if (this.member.id !== null){
            this.memberSaveSynchronizer.sync();
        }
        this.updateBarLabel();
        this.view.setNeedsLayout();
        this.updateCaption();
    },

    lastNameChanged: function(){
        if (this.member.id !== null){
            this.memberSaveSynchronizer.sync();
        }
        this.updateBarLabel();
        this.view.setNeedsLayout();
    },

    textFieldDidReceiveEnter: function(textField){
        if (textField === this.firstNameField || textField === this.lastNameField){
            this.firstNameField.window.firstResponder = null;
        }
    },

    textFieldDidChange: function(textField){
        if (textField === this.firstNameField || textField === this.lastNameField){
            this.view.setNeedsLayout();
        }
    },

    barEditorDidChange: function(barEditor){
        if (this.bar.shared){
            this.barPopupButton.selectedTag = "__custom__";
            this.customizeBar();
        }else{
            this.barSaveSynchronizer.sync();
        }
    },

    barEditorWillOpenItemDetailViewController: function(barEditor, viewController){
        viewController.service = this.service;
        viewController.community = this.community;
    },

    combinedSyncState: JSSynchronizer.State.idle,

    updateCombinedSyncState: function(){
        this.combinedSyncState = this._getCombinedSyncState();
    },

    _getCombinedSyncState: function(){
        if (this.memberSaveSynchronizer.state === JSSynchronizer.State.working || this.barSaveSynchronizer.state === JSSynchronizer.State.working){
            return JSSynchronizer.State.working;
        }
        if (this.memberSaveSynchronizer.state === JSSynchronizer.State.pending || this.barSaveSynchronizer.state === JSSynchronizer.State.pending){
            return JSSynchronizer.State.pending;
        }
        if (this.memberSaveSynchronizer.state === JSSynchronizer.State.error || this.barSaveSynchronizer.state === JSSynchronizer.State.error){
            return JSSynchronizer.State.error;
        }
        if (this.memberSaveSynchronizer.state === JSSynchronizer.State.success || this.barSaveSynchronizer.state === JSSynchronizer.State.success){
            return JSSynchronizer.State.success;
        }
        return JSSynchronizer.State.idle;
    },

    resync: function(){
        if (this.memberSaveSynchronizer.state === JSSynchronizer.State.error){
            this.memberSaveSynchronizer.sync();
        }
        if (this.barSaveSynchronizer.state === JSSynchronizer.State.error){
            this.barSaveSynchronizer.sync();
        }
    },

    syncIndicator: JSOutlet(),
    memberSaveSynchronizer: null,

    saveMember: function(syncContext){
        if (this.deleted){
            return;
        }
        syncContext.started();
        if (this.member.id === null){
            this.service.createCommunityMember(this.community.id, this.member.dictionaryRepresentation(), function(result, response){
                if (result !== Service.Result.success){
                    syncContext.completed(new Error("Request failed"));
                    return;
                }
                var replacedMember = this.member;
                this.member = Member.initWithDictionary(response.member);
                this.community.addMember(this.member);
                this.service.notificationCenter.post(Community.Notification.memberChanged, this.community, {member: this.member, replacedMember: replacedMember});
                syncContext.completed();
            }, this);
        }else{
            this.service.saveCommunityMember(this.community.id, this.member.dictionaryRepresentation(), function(result){
                if (result !== Service.Result.success){
                    syncContext.completed(new Error("Request Failed"));
                    return;
                }
                this.community.updateMember(this.member);
                this.service.notificationCenter.post(Community.Notification.memberChanged, this.community, {member: this.member});
                syncContext.completed();
            }, this);
        }
    },

    barSaveSynchronizer: null,

    saveBar: function(syncContext){
        if (this.deleted){
            return;
        }
        syncContext.started();
        if (this.bar.id === null){
            this.service.createCommunityBar(this.community.id, this.bar.dictionaryRepresentation(), function(result, post){
                if (result !== Service.Result.success){
                    syncContext.completed(new Error("Request failed"));
                    return;
                }
                var bar = Bar.initWithDictionary(post.bar);
                this.community.addBar(bar);
                this.member.barId = bar.id;
                this.bar = bar;
                this.memberSaveSynchronizer.sync();
                syncContext.completed();
            }, this);
        }else{
            this.service.saveCommunityBar(this.community.id, this.bar.dictionaryRepresentation(), function(result, post){
                if (result !== Service.Result.success){
                    syncContext.completed(new Error("Request failed"));
                    return;
                }
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
            this.deleteMember();
        }, this);
        alert.addActionWithTitle(this.localizedString("deleteConfirmation.cancel"), UIAlertAction.Style.cancel, function(){
        }, this);
        if (sender instanceof UIView){
            alert.popupAdjacentToView(sender, UIPopupWindow.Placement.below, true);
        }else{
            alert.popupCenteredInView(this.view, true);
        }
    },

    deleteMember: function(){
        if (this.member.id === null){
            this.deleted = true;
            this.service.notificationCenter.post(Community.Notification.memberDeleted, this.community, {member: this.member});
            return;
        }
        this.detailView.hidden = true;
        this.showActivityIndicator();
        this.service.deleteCommunityMember(this.community.id, this.member.id, function(result, response, badRequest){
            this.hideActivityIndicator();
            if (result !== Service.Result.success){
                this.detailView.hidden = false;
                var title;
                var message;
                if (badRequest !== null && badRequest.error === "cannot_delete_self"){
                    title = this.localizedString("deleteError.self.title");
                    message = this.localizedString("deleteError.self.message");
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
            this.community.removeMember(this.member);
            this.service.notificationCenter.post(Community.Notification.memberDeleted, this.community, {member: this.member});
        }, this);
    },

    changeBar: function(){
        var selectedTag = this.barPopupButton.selectedTag;
        if (selectedTag === "__custom__"){
            this.customizeBar();
        }else{
            if (selectedTag === "__default__"){
                this.member.barId = null;
            }else{
                this.member.barId = selectedTag;
            }
            var deletingBar = null;
            if (!this.bar.shared){
                deletingBar = this.bar;
            }
            this.memberSaveSynchronizer.sync(function(){
                if (this.memberSaveSynchronizer.error === null){
                    if (deletingBar !== null){
                        this.service.deleteCommunityBar(this.community.id, deletingBar.id, function(result){
                            if (result !== Service.Result.success){
                                // TODO:
                                return;
                            }
                            this.community.removeBar(deletingBar);
                        }, this);
                    }
                }
            }, this);
            this.bar = null;
            this.loadBar();
        }
    },

    customizeBar: function(){
        this.bar.id = null;
        this.bar.name = "%s's Bar".sprintf(this.member.fullName);
        this.bar.shared = false;
        this.barSaveSynchronizer.sync();
    },

    // MARK: - Invitations

    sendInvitation: function(sender){
        if (this.inviteWindowController === null){
            this.inviteWindowController = InviteWindowController.initWithSpecName("InviteWindowController");
            this.inviteWindowController.delegate = this;
            this.inviteWindowController.service = this.service;
            this.inviteWindowController.community = this.community;
            this.inviteWindowController.member = this.member;
            this.inviteWindowController.prepareWindowIfNeeded();
            var window = this.inviteWindowController.window;
            var sourceRect = JSRect(sender.convertRectToScreen(sender.bounds).center, JSSize(1, 1));
            var translation = sourceRect.center.subtracting(window.frame.center);
            var transform = JSAffineTransform.Translated(translation.x, translation.y);
            var scale = Math.min(sourceRect.size.width / window.frame.size.width, sourceRect.size.height / window.frame.size.height);
            transform = transform.scaledBy(scale);
            window.transform = transform;
            window.openAnimator = UIViewPropertyAnimator.initWithDuration(0.12);
            window.openAnimator.addAnimations(function(){
                window.transform = JSAffineTransform.Identity;
            }, this);
            window.closeAnimator = UIViewPropertyAnimator.initWithDuration(0.12);
            window.closeAnimator.addAnimations(function(){
                var sourceRect = JSRect(sender.convertRectToScreen(sender.bounds).center, JSSize(1, 1));
                var translation = sourceRect.center.subtracting(window.frame.center);
                var transform = JSAffineTransform.Translated(translation.x, translation.y);
                var scale = Math.min(sourceRect.size.width / window.frame.size.width, sourceRect.size.height / window.frame.size.height);
                transform = transform.scaledBy(scale);
                window.transform = transform;
            }, this);
        }
        this.inviteWindowController.makeKeyAndOrderFront();
    },

    // MARK: - Window Management

    inviteWindowController: null,

    windowControllerDidClose: function(windowController){
        if (windowController === this.inviteWindowController){
            this.inviteWindowController = null;
            this.update();
        }
    },

    closeWindows: function(){
        if (this.inviteWindowController !== null){
            this.inviteWindowController.close();
        }
    },

    // MARK: - Layout

    viewDidLayoutSubviews: function(){
        var bounds = this.view.bounds;
        this.detailView.frame = bounds;
        this.activityIndicator.position = bounds.center;
        this.errorView.sizeToFitSize(JSSize(Math.min(bounds.size.width - 40, 300), Number.MAX_VALUE));
        this.errorView.position = bounds.center;

        bounds = this.detailView.bounds;
        var x = bounds.size.width - 24;
        var baseline = 16 + this.firstNameField.firstBaselineOffsetFromTop;
        var buttonSize;
        if (!this.removeButton.hidden){
            buttonSize = this.removeButton.intrinsicSize;
            this.removeButton.frame = JSRect(x - buttonSize.width + this.removeButton.titleInsets.right, baseline - this.removeButton.firstBaselineOffsetFromTop, buttonSize.width, buttonSize.height);
            x -= buttonSize.width;
            x -= 24;
        }
        if (!this.sendInvitationButton.hidden){
            buttonSize = this.sendInvitationButton.intrinsicSize;
            this.sendInvitationButton.frame = JSRect(x - buttonSize.width, baseline - this.sendInvitationButton.firstBaselineOffsetFromTop, buttonSize.width, buttonSize.height);
            x -= buttonSize.width;
            x -= 24;
        }
        this.stateLabel.sizeToFit();
        this.stateLabel.frame = JSRect(x - this.stateLabel.bounds.size.width, baseline - this.stateLabel.firstBaselineOffsetFromTop, this.stateLabel.bounds.size.width, this.stateLabel.bounds.size.height);
        x -= this.stateLabel.bounds.size.width;
        x -= 7;
        this.stateIndicator.position = JSPoint(x - this.stateIndicator.bounds.size.width / 2, this.stateLabel.position.y);
        x -= this.stateIndicator.bounds.size.width;
        x -= 12;
        var maxX = x;

        x = 24 - this.firstNameField.textInsets.left;
        var maxNameSize = JSSize((maxX - x) / 2, Number.MAX_VALUE);
        this.firstNameField.sizeToFitText(maxNameSize);
        this.lastNameField.sizeToFitText(maxNameSize);
        this.firstNameField.position = JSPoint(x + this.firstNameField.bounds.size.width / 2, baseline - this.firstNameField.firstBaselineOffsetFromTop + this.firstNameField.bounds.size.height / 2);
        x += this.firstNameField.bounds.size.width;
        x += 2;
        this.lastNameField.position = JSPoint(x + this.lastNameField.bounds.size.width / 2, this.firstNameField.position.y);
        var y = baseline + this.firstNameField.lastBaselineOffsetFromBottom;
        y += 20;

        x = 24;
        baseline = y + this.barLabel.firstBaselineOffsetFromTop;
        this.barLabel.sizeToFit();
        this.barLabel.frame = JSRect(x, y, this.barLabel.bounds.size.width, this.barLabel.bounds.size.height);
        x += this.barLabel.bounds.size.width;
        x += 7;
        var popupButtonSize = this.barPopupButton.intrinsicSize;
        this.barPopupButton.frame = JSRect(x, baseline - this.barPopupButton.firstBaselineOffsetFromTop, popupButtonSize.width, popupButtonSize.height);
        y = baseline + this.barPopupButton.lastBaselineOffsetFromBottom;

        y += 7;
        this.barEditor.frame = JSRect(24, y, bounds.size.width - 48, bounds.size.height - y - 24);
        this.barLoadingView.frame = this.barEditor.frame;

        var indicatorSize = this.syncIndicator.intrinsicSize;
        this.syncIndicator.frame = JSRect(this.view.bounds.size.width - 5 - indicatorSize.width, 5, indicatorSize.width, indicatorSize.height);
    }

});

MemberDetailViewController.stateColorTransformer = {

    transformValue: function(state){
        switch (state){
            case Member.State.uninvited:
                return JSColor.initWithWhite(0.85);
            case Member.State.invited:
                return JSColor.initWithRGBA(1, 0.65, 0);
            case Member.State.active:
                return JSColor.initWithRGBA(0, 129/255.0, 69/255.0);
        }
        return null;
    }

};

MemberDetailViewController.stateLabelTransformer = {
    transformValue: function(state){
        switch (state){
            case Member.State.uninvited:
                return JSBundle.mainBundle.localizedString("state.uninvited.text", "MemberDetailViewController");
            case Member.State.invited:
                return JSBundle.mainBundle.localizedString("state.invited.text", "MemberDetailViewController");
            case Member.State.active:
                return JSBundle.mainBundle.localizedString("state.active.text", "MemberDetailViewController");
        }
        return null;
    }
};