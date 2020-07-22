// #import UIKit
// #import "Service+Extensions.js"
// #import "CommunityViewController.js"
'use strict';

JSClass("CommunitiesViewController", UIViewController, {

    service: null,
    defaults: null,

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
            this.communities = page.communities.sort(function(a, b){
                return a.name.localeCompare(b.name);
            });
            var selectedCommunityIndex = 0;
            for (var i = this.communities.length - 1; i >= 0 ; --i){
                community = page.communities[i];
                if (community.role != "manager"){
                    this.communities.splice(i, 1);
                    if (selectedCommunityIndex > i){
                        --selectedCommunityIndex;
                    }
                }else{
                    if (community.id == this.defaults.valueForKey("selectedCommunityId")){
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
            this._skipNextSelection = true;
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
        this.activityIndicator.startAnimating();
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

    _skipNextSelection: false,

    listViewDidSelectCellAtIndexPath: function(listView, indexPath){
        if (this._skipNextSelection){
            this._skipNextSelection = false;
            return;
        }
        var community = this.communities[indexPath.row];
        this.showCommunity(community, true);
    },

    // MARK: - Selecting a community

    showCommunity: function(community, animated){
        var communityViewController = CommunityViewController.initWithSpecName("CommunityViewController");
        communityViewController.communityId = community.id;
        communityViewController.service = this.service;
        communityViewController.defaults = this.defaults;
        communityViewController.navigationItem.title = community.name;
        if (!animated){
            communityViewController.startingActivityAnimationPercentComplete = 1;
            if (this.activityFadeInAnimation !== null){
                communityViewController.startingActivityAnimationPercentComplete = this.activityFadeInAnimation.percentComplete;
            }
        }
        this.navigationController.pushViewController(communityViewController, animated);
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