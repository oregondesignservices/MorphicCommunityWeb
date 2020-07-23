// #import UIKit
// #import "Service.js"
'use strict';

JSProtocol("BarDetailViewControllerDelegate", JSProtocol, {

    barDetailViewControllerDidChangeBar: function(viewController, bar, replacingBar){}

});

JSClass("BarDetailViewController", UIViewController, {

    community: null,
    barId: null,
    bar: null,
    service: null,

    // MARK: - View Lifecycle

    viewDidLoad: function(){
        BarDetailViewController.$super.viewDidLoad.call(this);
    },

    viewWillAppear: function(animated){
        BarDetailViewController.$super.viewWillAppear.call(this, animated);
    },

    viewDidAppear: function(animated){
        BarDetailViewController.$super.viewDidAppear.call(this, animated);
        if (this.bar === null){
            this.loadBar();
        }else{
            this.detailView.hidden = false;
            this.nameField.text = this.bar.name;
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

    // MARK: - Loading Data

    loadBar: function(){
        this.showActivityIndicator();
        this.errorView.hidden = true;
        this.service.loadCommunityBar(this.community.id, this.barId, function(result, bar){
            this.hideActivityIndicator();
            if (result !== Service.Result.success){
                this.errorView.hidden = false;
                return;
            }
            this.bar = bar;
            this.nameField.text = bar.name;
            this.detailView.hidden = false;
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
        this.activityIndicator.startAnimating();
    },

    errorView: JSOutlet(),

    // MARK: - Saving Data

    nameEditingEnded: function(){
        if (this.bar.id === null){
            this.bar.name = this.nameField.text;
            this.saveBar();
        }
    },

    textFieldDidReceiveEnter: function(textField){
        if (textField === this.nameField){
            this.bar.name = this.nameField.text;
            this.saveBar();
        }
    },

    saveTask: null,
    saveQueued: false,

    saveBar: function(){
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

    // MARK: - Layout

    viewDidLayoutSubviews: function(){
        var bounds = this.view.bounds;
        this.detailView.frame = bounds;
        this.activityIndicator.position = bounds.center;
        this.errorView.sizeToFitSize(JSSize(Math.min(bounds.size.width - 40, 300), Number.MAX_VALUE));
        this.errorView.position = bounds.center;

        bounds = this.detailView.bounds;
        this.nameField.frame = JSRect(24, 16, 300, this.nameField.intrinsicSize.height);
        var y = this.nameField.frame.origin.y + this.nameField.frame.size.height + 40;
        this.barEditor.frame = JSRect(24, y, bounds.size.width - 48, bounds.size.height - y - 24);
    }

});