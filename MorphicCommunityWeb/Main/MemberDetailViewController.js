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
        var format = JSBundle.mainBundle.localizedString("barLabel.textFormat", "MemberDetailViewController");
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
        var defaultFormat = JSBundle.mainBundle.localizedString("barPopupButton.defaultFormat", "MemberDetailViewController");
        this.barPopupButton.addItemWithTitle(String.initWithFormat(defaultFormat, defaultBar.name), "__default__");
        for (i = 0, l = bars.length; i < l; ++i){
            bar = bars[i];
            this.barPopupButton.addItemWithTitle(bar.name, bar.id);
        }
        this.barPopupButton.addItemWithTitle(JSBundle.mainBundle.localizedString("barPopupButton.custom", "MemberDetailViewController"), "__custom__");
        this.barPopupButton.selectedTag = selectedTag;
    },

    updateInviteButton: function(){
        switch (this.member.state){
            case Member.State.uninvited:
                this.sendInvitationButton.hidden = false;
                break;
            case Member.State.invited:
                this.sendInvitationButton.hidden = false;
                this.sendInvitationButton.titleLabel.text = JSBundle.mainBundle.localizedString("resendInviteButton.title", "MemberDetailViewController");
                break;
            case Member.State.active:
                this.sendInvitationButton.hidden = true;
                break;
        }
    },

    updateCaption: function(){
        if (this.member.firstName){
            this.barEditor.captionLabel.text = String.initWithFormat(JSBundle.mainBundle.localizedString("preview.caption", "MemberDetailViewController"), this.member.firstName);
        }else{
            this.barEditor.captionLabel.text = JSBundle.mainBundle.localizedString("preview.unnamedCaption", "MemberDetailViewController");
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
            this.saveMember();
        }
    },

    firstNameChanged: function(){
        if (this.member.id !== null){
            this.saveMember();
        }
        this.updateBarLabel();
        this.view.setNeedsLayout();
        this.updateCaption();
    },

    lastNameChanged: function(){
        if (this.member.id !== null){
            this.saveMember();
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
            this.saveBar();
        }
    },

    saveTask: null,
    saveQueued: false,

    saveMember: function(completion, target){
        if (this.deleted){
            completion.call(target, false);
            return;
        }
        if (this.saveTask !== null){
            this.saveQueued = true;
            // FIXME: save completion and target so they can be called when
            // the final save completes
            return;
        }
        var success = false;
        var completeSave = function(){
            this.saveTask = null;
            if (this.saveQueued){
                this.saveQueued = false;
                this.saveMember(completion, target);
            }else{
                if (completion){
                    completion.call(target, success);
                }
            }
        };
        if (this.member.id === null){
            this.saveTask = this.service.createCommunityMember(this.community.id, this.member.dictionaryRepresentation(), function(result, response){
                if (result !== Service.Result.success){
                    // TODO: show error?
                }else{
                    success = true;
                    var replacedMember = this.member;
                    this.member = Member.initWithDictionary(response.member);
                    this.community.addMember(this.member);
                    this.service.notificationCenter.post(Community.Notification.memberChanged, this.community, {member: this.member, replacedMember: replacedMember});
                }
                completeSave.call(this);
            }, this);
        }else{
            this.saveTask = this.service.saveCommunityMember(this.community.id, this.member.dictionaryRepresentation(), function(result){
                if (result !== Service.Result.success){
                    // TODO: show error?
                }else{
                    success = true;
                    this.community.updateMember(this.member);
                    this.service.notificationCenter.post(Community.Notification.memberChanged, this.community, {member: this.member});
                }
                completeSave.call(this);
            }, this);
        }
    },

    saveBarTask: null,
    saveBarQueued: false,

    saveBar: function(){
        if (this.deleted){
            return;
        }
        if (this.saveBarTask !== null){
            this.saveBarQueued = true;
            return;
        }
        var completeSave = function(){
            this.saveBarTask = null;
            if (this.saveBarQueued){
                this.saveBarQueued = false;
                this.saveBar();
            }
        };
        if (this.bar.id === null){
            this.saveBarTask = this.service.createCommunityBar(this.community.id, this.bar.dictionaryRepresentation(), function(result, post){
                if (result !== Service.Result.success){
                    // TODO:
                }else{
                    var bar = Bar.initWithDictionary(post.bar);
                    this.community.addBar(bar);
                    this.member.barId = bar.id;
                    this.bar = bar;
                    this.saveMember();
                }
                completeSave.call(this);
            }, this);
        }else{
            this.saveBarTask = this.service.saveCommunityBar(this.community.id, this.bar.dictionaryRepresentation(), function(result, post){
                if (result !== Service.Result.success){
                    // TODO:
                }else{
                    completeSave.call(this);
                }
            }, this);
        }
    },

    deleted: false,

    confirmDelete: function(sender){
        var message = JSBundle.mainBundle.localizedString("deleteConfirmation.message", "MemberDetailViewController");
        var alert = UIAlertController.initWithTitle(null, message);
        alert.destructiveButtonStyler = UIButtonDefaultStyler.init();
        alert.destructiveButtonStyler.font = alert.destructiveButtonStyler.font.fontWithPointSize(JSFont.Size.detail).fontWithWeight(JSFont.Weight.bold);
        alert.destructiveButtonStyler.normalTitleColor = JSColor.initWithRGBA(129/255.0, 43/255.0, 0);
        alert.destructiveButtonStyler.activeTitleColor = alert.destructiveButtonStyler.normalTitleColor.colorDarkenedByPercentage(0.2);
        alert.addActionWithTitle(JSBundle.mainBundle.localizedString("deleteConfirmation.delete", "MemberDetailViewController"), UIAlertAction.Style.destructive, function(){
            this.deleteMember();
        }, this);
        alert.addActionWithTitle(JSBundle.mainBundle.localizedString("deleteConfirmation.cancel", "MemberDetailViewController"), UIAlertAction.Style.cancel, function(){
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
                    title = JSBundle.mainBundle.localizedString("deleteError.self.title", "MemberDetailViewController");
                    message = JSBundle.mainBundle.localizedString("deleteError.self.message", "MemberDetailViewController");
                }else{
                    title = JSBundle.mainBundle.localizedString("deleteError.general.title", "MemberDetailViewController");
                    message = JSBundle.mainBundle.localizedString("deleteError.general.message", "MemberDetailViewController");
                }
                
                var alert = UIAlertController.initWithTitle(title, message);
                alert.addActionWithTitle(JSBundle.mainBundle.localizedString("deleteError.dismiss", "MemberDetailViewController"), UIAlertAction.Style.cancel, function(){
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
            this.saveMember(function(success){
                if (success){
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
        this.saveBar();
    },

    // MARK: - Invitations

    sendInvitation: function(){
        if (this.inviteWindowController === null){
            this.inviteWindowController = InviteWindowController.initWithSpecName("InviteWindowController");
            this.inviteWindowController.delegate = this;
            this.inviteWindowController.service = this.service;
            this.inviteWindowController.community = this.community;
            this.inviteWindowController.member = this.member;
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