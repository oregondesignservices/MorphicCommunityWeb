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
// #import "CommunityViewController.js"
'use strict';

JSClass("CommunitiesViewController", UIViewController, {

    mainViewController: JSOutlet(),

    service: null,

    communities: null,

    // MARK: - View Lifecycle

    viewDidLoad: function(){
        CommunitiesViewController.$super.viewDidLoad.call(this);
    },

    _hasAppeared: false,

    viewWillAppear: function(animated){
        CommunitiesViewController.$super.viewWillAppear.call(this, animated);
        if (this._didDisappear){
            this.listView.reloadData();
        }
    },

    _didDisappear: false,

    viewDidAppear: function(animated){
        CommunitiesViewController.$super.viewDidAppear.call(this, animated);
        if (!this._hasAppeared){
            this._hasAppeared = true;
            this.loadCommunities();
        }
        if (this._didDisappear){
            this._didDisappear = false;
            var originalIndex = this.listView.selectedIndexPath.row;
            var selectedCommunity = this.communities[originalIndex];
            this.communities.sort(Community.nameComparison);
            this.listView.reloadData();
            this.listView.layoutIfNeeded();
            var searcher = JSBinarySearcher(this.communities, Community.nameComparison);
            var index = searcher.indexMatchingValue(selectedCommunity);
            if (index !== originalIndex){
                this.listView.selectedIndexPath = JSIndexPath(0, index);
            }
            this.listView.setSelectedIndexPathAnimated(null);
        }
    },

    viewWillDisappear: function(animated){
        CommunitiesViewController.$super.viewWillDisappear.call(this, animated);
    },

    viewDidDisappear: function(animated){
        CommunitiesViewController.$super.viewDidDisappear.call(this, animated);
        this._didDisappear = true;
    },

    // MARK: - Data Loading

    loadCommunities: function(){
        this.showActivityIndicator();
        this.errorView.hidden = true;
        this.emptyView.hidden = true;
        this.service.loadCommunities(function(result, page){
            if (result !== Service.Result.success){
                this.hideActivityIndicator();
                this.errorView.hidden = false;
                return;
            }
            var community;
            this.communities = page.communities.sort(Community.nameComparison);
            var selectedCommunityIndex = 0;
            for (var i = this.communities.length - 1; i >= 0 ; --i){
                community = page.communities[i];
                if (community.role != "manager"){
                    this.communities.splice(i, 1);
                    if (selectedCommunityIndex > i){
                        --selectedCommunityIndex;
                    }
                }else{
                    if (community.id == this.service.defaults.valueForKey("selectedCommunityId")){
                        selectedCommunityIndex = i;
                    }
                }
            }
            if (this.communities.length === 0){
                this.hideActivityIndicator();
                this.emptyView.hidden = false;
                return;
            }
            this.community = this.communities[selectedCommunityIndex];
            if (this.activityFadeInAnimation !== null){
                this.activityFadeInAnimation.pause();
            }
            this.showCommunity(this.community, false);
            this.listView.reloadData();
            this.listView.selectedIndexPath = JSIndexPath(0, selectedCommunityIndex);
            this.hideActivityIndicator();
            return;
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

    // MARK: - List View Data Source

    listView: JSOutlet(),

    numberOfSectionsInListView: function(listView){
        if (this.communities === null){
            return 0;
        }
        return 1;
    },

    numberOfRowsInListViewSection: function(listView, sectionIndex){
        return this.communities.length;
    },

    cellForListViewAtIndexPath: function(listView, indexPath){
        var cell = listView.dequeueReusableCellWithIdentifier("community", indexPath);
        var community = this.communities[indexPath.row];
        cell.titleLabel.text = community.name;
        cell.titleInsets.left = 34;
        return cell;
    },

    listViewDidSelectCellAtIndexPath: function(listView, indexPath){
        var community = this.communities[indexPath.row];
        this.showCommunity(community, true);
    },

    // MARK: - Selecting a community

    showCommunity: function(community, animated){
        var communityViewController = CommunityViewController.initWithSpecName("CommunityViewController");
        communityViewController.partialCommunity = community;
        communityViewController.service = this.service;
        communityViewController.navigationItem.title = community.name;
        communityViewController.mainViewController = this.mainViewController;
        if (!animated){
            communityViewController.startingActivityAnimationPercentComplete = 1;
            if (this.activityFadeInAnimation !== null){
                communityViewController.startingActivityAnimationPercentComplete = this.activityFadeInAnimation.percentComplete;
            }
        }
        this.navigationController.pushViewController(communityViewController, animated);
    },

    // MARK: - Adding a community

    addCommunity: function(sender){
        var popupWindow = UIPopupWindow.init();
        popupWindow.frame = JSRect(0, 0, 200, 0);
        popupWindow.heightTracksContent = true;
        var contentView = CreateCommunityView.init();
        contentView.nameField = UITextField.init();
        contentView.addSubview(contentView.nameField);
        contentView.nameField.placeholder = JSBundle.mainBundle.localizedString("sidebar.communities.nameField.placeholder", "MainScene");
        contentView.nameField.delegate = this;
        popupWindow.contentView = contentView;
        popupWindow._initialFirstResponder = contentView.nameField;
        popupWindow.escapeClosesWindow = true;
        popupWindow.sizeToFit();
        this.view.window.modal = popupWindow;
        popupWindow.openAdjacentToView(sender, UIPopupWindow.Placement.below);
    },

    textFieldDidReceiveEnter: function(textField){
        var name = textField.text;
        textField.enabled = false;
        this.service.createCommunity({name: name}, function(result, post){
            if (result !== Service.Result.success){
                textField.enabled = true;
                var alert = UIAlertController.initWithTitle(
                    JSBundle.mainBundle.localizedString("sidebar.communities.errors.createFailed.title", "MainScene"),
                    JSBundle.mainBundle.localizedString("sidebar.communities.errors.createFailed.message", "MainScene")
                );
                alert.addAction(UIAlertAction.initWithTitle(
                    JSBundle.mainBundle.localizedString("sidebar.communities.errors.createFailed.dismiss.title", "MainScene"),
                    UIAlertAction.Style.cancel
                ));
                alert.popupCenteredInView(textField.window, true);
                return;
            }
            textField.window.close();
            var community = Community.init();
            community.id = post.community.id;
            community.name = post.community.name;
            var searcher = JSBinarySearcher(this.communities, Community.nameComparison);
            var index = searcher.insertionIndexForValue(community);
            this.communities.splice(index, 0, community);
            this.listView.insertRowAtIndexPath(JSIndexPath(0, index));
            this.listView.layoutIfNeeded();
            this.listView.selectedIndexPath = JSIndexPath(0, index);
            this.showCommunity(community, true);
        }, this);
    },

    // MARK: - Layout

    errorView: JSOutlet(),
    emptyView: JSOutlet(),
    watermarkView: JSOutlet(),

    viewDidLayoutSubviews: function(){
        var bounds =this.view.bounds;
        this.listView.frame = bounds;
        var maxSize = bounds.rectWithInsets(JSInsets(20)).size;
        this.errorView.sizeToFitSize(maxSize);
        this.emptyView.sizeToFitSize(maxSize);
        var center = bounds.center;
        this.activityIndicator.position = center;
        this.errorView.position = center;
        this.emptyView.position = center;
        this.watermarkView.bounds = JSRect(0, 0, bounds.size.width, bounds.size.width);
        this.watermarkView.position = JSPoint(bounds.center.x, bounds.size.height - 125 + bounds.size.width / 2.0); 
    }

});

JSClass("CreateCommunityView", UIView, {

    nameField: null,

    initWithFrame: function(frame){
        CreateCommunityView.$super.initWithFrame.call(this, frame);
    },

    sizeToFitSize: function(maxSize){
        this.bounds = JSRect(0, 0, 180, this.nameField.intrinsicSize.height);
    },

    layoutSubviews: function(){
        this.nameField.frame = this.bounds;
    }

});