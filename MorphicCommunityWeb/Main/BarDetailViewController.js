// #import UIKit
// #import "Service.js"
'use strict';

JSProtocol("BarDetailViewControllerDelegate", JSProtocol, {

    barDetailViewControllerDidChangeBar: function(viewController, bar, replacingBar){},
    barDetailViewControllerDidDeleteBar: function(viewController, bar){}

});

JSClass("BarDetailViewController", UIViewController, {

    community: null,
    bar: null,
    service: null,
    delegate: null,

    // MARK: - View Lifecycle

    viewDidLoad: function(){
        BarDetailViewController.$super.viewDidLoad.call(this);
    },

    viewWillAppear: function(animated){
        BarDetailViewController.$super.viewWillAppear.call(this, animated);
    },

    viewDidAppear: function(animated){
        BarDetailViewController.$super.viewDidAppear.call(this, animated);
        if (this.bar.id !== null){
            this.loadBar();
        }else{
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
            this.bar = bar;
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
        this.nameField.text = this.bar.name;
        this.removeButton.hidden = this.bar.id === this.community.default_bar_id;
        this.view.setNeedsLayout();
    },

    errorView: JSOutlet(),

    // MARK: - Saving Data

    nameEditingEnded: function(){
        if (this.bar.id === null){
            this.bar.name = this.nameField.text;
            this.saveBar();
        }
    },

    nameChanged: function(){
        if (this.bar.id !== null){
            this.bar.name = this.nameField.text;
            this.saveBar();
        }
    },

    textFieldDidReceiveEnter: function(textField){
        if (textField === this.nameField){
            this.nameField.window.firstResponder = null;
        }
    },

    textFieldDidChange: function(textField){
        if (textField === this.nameField){
            this.view.setNeedsLayout();
            // this.view.layoutIfNeeded();
        }
    },

    saveTask: null,
    saveQueued: false,

    saveBar: function(){
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
                this.saveBar();
            }
        };
        if (this.bar.id === null){
            this.saveTask = this.service.createCommunityBar(this.community.id, this.bar, function(result, response){
                if (result !== Service.Result.success){
                    // TODO: show error?
                }else{
                    var replacedBar = this.bar;
                    this.bar = response.bar;
                    if (this.delegate && this.delegate.barDetailViewControllerDidChangeBar){
                        this.delegate.barDetailViewControllerDidChangeBar(this, this.bar, replacedBar);
                    }
                }
                completeSave.call(this);
            }, this);
        }else{
            this.saveTask = this.service.saveCommunityBar(this.community.id, this.bar, function(result){
                if (result !== Service.Result.success){
                    // TODO: show error?
                }else{
                    if (this.delegate && this.delegate.barDetailViewControllerDidChangeBar){
                        this.delegate.barDetailViewControllerDidChangeBar(this, this.bar, null);
                    }
                }
                completeSave.call(this);
            }, this);
        }
    },

    deleted: false,

    confirmDelete: function(sender){
        var message = JSBundle.mainBundle.localizedString("deleteConfirmation.message", "BarDetailViewController");
        var alert = UIAlertController.initWithTitle(null, message);
        alert.addActionWithTitle(JSBundle.mainBundle.localizedString("deleteConfirmation.delete", "BarDetailViewController"), UIAlertAction.Style.destructive, function(){
            this.deleteBar();
        }, this);
        alert.addActionWithTitle(JSBundle.mainBundle.localizedString("deleteConfirmation.cancel", "BarDetailViewController"), UIAlertAction.Style.cancel, function(){
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
            if (this.delegate && this.delegate.barDetailViewControllerDidDeleteBar){
                this.delegate.barDetailViewControllerDidDeleteBar(this, this.bar);
            }
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
                    title = JSBundle.mainBundle.localizedString("deleteError.inUse.title", "BarDetailViewController");
                    message = JSBundle.mainBundle.localizedString("deleteError.inUse.message", "BarDetailViewController");
                }else{
                    title = JSBundle.mainBundle.localizedString("deleteError.general.title", "BarDetailViewController");
                    message = JSBundle.mainBundle.localizedString("deleteError.general.message", "BarDetailViewController");
                }
                
                var alert = UIAlertController.initWithTitle(title, message);
                alert.addActionWithTitle(JSBundle.mainBundle.localizedString("deleteError.dismiss", "BarDetailViewController"), UIAlertAction.Style.cancel, function(){
                }, this);
                alert.popupCenteredInView(this.view, true);
                return;
            }
            this.deleted = true;
            if (this.delegate && this.delegate.barDetailViewControllerDidDeleteBar){
                this.delegate.barDetailViewControllerDidDeleteBar(this, this.bar);
            }
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
        var removeButtonSize = this.removeButton.intrinsicSize;
        this.removeButton.frame = JSRect(bounds.size.width - 24 - removeButtonSize.width + this.removeButton.titleInsets.right, baseline - this.removeButton.firstBaselineOffsetFromTop, removeButtonSize.width, removeButtonSize.height);
        var x = 24 - this.nameField.textInsets.left;
        var maxNameSize = JSSize(this.removeButton.frame.origin.x - x - 10, Number.MAX_VALUE);
        this.nameField.sizeToFitText(maxNameSize);
        this.nameField.position = JSPoint(x + this.nameField.bounds.size.width / 2, baseline - this.nameField.firstBaselineOffsetFromTop + this.nameField.bounds.size.height / 2);
        var y = this.nameField.frame.origin.y + this.nameField.frame.size.height + 40;
        this.barEditor.frame = JSRect(24, y, bounds.size.width - 48, bounds.size.height - y - 24);
    }

});