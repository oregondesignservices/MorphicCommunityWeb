// #import UIKit
// #import "Service.js"
'use strict';

JSProtocol("MemberDetailViewControllerDelegate", JSProtocol, {

    memberDetailViewControllerDidChangeMember: function(viewController, member, replacingMember){},
    memberDetailViewControllerDidDeleteMember: function(viewController, member){}

});

JSClass("MemberDetailViewController", UIViewController, {

    community: null,
    member: null,
    service: null,
    delegate: null,

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
            this.loadMember();
        }else{
            this.update();
            this.view.window.firstResponder = this.firstNameField;
            this.firstNameField.selectAll();
        }
    },

    viewWillDisappear: function(animated){
        MemberDetailViewController.$super.viewWillDisappear.call(this, animated);
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
            this.member = member;
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
        this.detailView.hidden = false;
        this.firstNameField.text = this.member.first_name;
        this.lastNameField.text = this.member.last_name;
        switch (this.member.state){
            case "uninvited":
                this.stateIndicator.backgroundColor = JSColor.initWithWhite(0.85);
                this.stateLabel.text = JSBundle.mainBundle.localizedString("state.uninvited.text", "MemberDetailViewController");
                this.sendInvitationButton.hidden = false;
                break;
            case "invited":
                this.stateIndicator.backgroundColor = JSColor.initWithRGBA(1, 0.65, 0);
                this.stateLabel.text = JSBundle.mainBundle.localizedString("state.invited.text", "MemberDetailViewController");
                this.sendInvitationButton.hidden = false;
                this.sendInvitationButton.titleLabel.text = JSBundle.localizedString("resendInviteButton.title", "MemberDetailViewController");
                break;
            case "active":
                this.stateIndicator.backgroundColor = JSColor.initWithRGBA(0, 129/255.0, 69/255.0);
                this.stateLabel.text = JSBundle.mainBundle.localizedString("state.active.text", "MemberDetailViewController");
                this.sendInvitationButton.hidden = true;
                break;
        }
        this.view.setNeedsLayout();
    },

    errorView: JSOutlet(),

    // MARK: - Saving Data

    firstNameEditingEnded: function(){
        if (this.member.id === null){
            this.member.first_name = this.firstNameField.text;
            this.saveMember();
        }
    },

    firstNameChanged: function(){
        if (this.member.id !== null){
            this.member.first_name = this.firstNameField.text;
            this.saveMember();
        }
    },

    lastNameChanged: function(){
        if (this.member.id !== null){
            this.member.last_name = this.lastNameField.text;
            this.saveMember();
        }
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

    saveTask: null,
    saveQueued: false,

    saveMember: function(){
        if (this.deleted){
            return;
        }
        if (this.saveTask !== null){
            this.saveQueued = true;
            return;
        }
        var completeSave = function(){
            this.saveTask = null;
            if (this.saveQueued){
                this.saveQueued = false;
                this.saveMember();
            }
        };
        if (this.member.id === null){
            this.saveTask = this.service.createCommunityMember(this.community.id, this.member, function(result, response){
                if (result !== Service.Result.success){
                    // TODO: show error?
                }else{
                    var replacedMember = this.member;
                    this.member = response.member;
                    if (this.delegate && this.delegate.memberDetailViewControllerDidChangeMember){
                        this.delegate.memberDetailViewControllerDidChangeMember(this, this.member, replacedMember);
                    }
                }
                completeSave.call(this);
            }, this);
        }else{
            this.saveTask = this.service.saveCommunityMember(this.community.id, this.member, function(result){
                if (result !== Service.Result.success){
                    // TODO: show error?
                }else{
                    if (this.delegate && this.delegate.memberDetailViewControllerDidChangeMember){
                        this.delegate.memberDetailViewControllerDidChangeMember(this, this.member, null);
                    }
                }
                completeSave.call(this);
            }, this);
        }
    },

    deleted: false,

    confirmDelete: function(sender){
        var message = JSBundle.mainBundle.localizedString("deleteConfirmation.message", "MemberDetailViewController");
        var alert = UIAlertController.initWithTitle(null, message);
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
            if (this.delegate && this.delegate.memberDetailViewControllerDidDeleteMember){
                this.delegate.memberDetailViewControllerDidDeleteMember(this, this.member);
            }
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
            if (this.delegate && this.delegate.memberDetailViewControllerDidDeleteMember){
                this.delegate.memberDetailViewControllerDidDeleteMember(this, this.member);
            }
        }, this);
    },

    // MARK: - Invitations

    sendInvitation: function(){
        // TODO:
    },

    // MARK: - Layout

    viewDidLayoutSubviews: function(){
        var bounds = this.view.bounds;
        this.detailView.frame = bounds;
        this.activityIndicator.position = bounds.center;
        this.errorView.sizeToFitSize(JSSize(Math.min(bounds.size.width - 40, 300), Number.MAX_VALUE));
        this.errorView.position = bounds.center;

        bounds = this.detailView.bounds;
        var baseline = 16 + this.firstNameField.font.displayAscender;
        var removeButtonSize = this.removeButton.intrinsicSize;
        this.removeButton.frame = JSRect(bounds.size.width - 24 - removeButtonSize.width + this.removeButton.titleInsets.right, baseline - this.removeButton.firstBaselineOffsetFromTop, removeButtonSize.width, removeButtonSize.height);
        var x = 24 - this.firstNameField.textInsets.left;
        var maxNameSize = JSSize((this.removeButton.frame.origin.x - x - 12) / 2, Number.MAX_VALUE);
        this.firstNameField.sizeToFitText(maxNameSize);
        this.lastNameField.sizeToFitText(maxNameSize);
        this.firstNameField.position = JSPoint(x + this.firstNameField.bounds.size.width / 2, baseline - this.firstNameField.firstBaselineOffsetFromTop + this.firstNameField.bounds.size.height / 2);
        x += this.firstNameField.bounds.size.width;
        x += 2;
        this.lastNameField.position = JSPoint(x + this.lastNameField.bounds.size.width / 2, this.firstNameField.position.y);

        var y = this.firstNameField.frame.origin.y + this.firstNameField.frame.size.height + 10;
        baseline = y + this.stateLabel.font.displayAscender;
        this.stateLabel.sizeToFit();
        x = 24;
        this.stateIndicator.position = JSPoint(x + this.stateIndicator.bounds.size.width / 2, y + (this.stateLabel.bounds.size.height) / 2);
        x += this.stateIndicator.bounds.size.width + 7;
        this.stateLabel.position = JSPoint(x + this.stateLabel.bounds.size.width / 2, y + this.stateLabel.bounds.size.height / 2);
        x += this.stateLabel.bounds.size.width;
        x += 24;
        var inviteButtonSize = this.sendInvitationButton.intrinsicSize;
        this.sendInvitationButton.frame = JSRect(x, baseline - this.sendInvitationButton.firstBaselineOffsetFromTop, inviteButtonSize.width, inviteButtonSize.height);
        y += this.stateLabel.frame.size.height;

        y += 30;
        this.barEditor.frame = JSRect(24, y, bounds.size.width - 48, bounds.size.height - y - 24);
    }

});