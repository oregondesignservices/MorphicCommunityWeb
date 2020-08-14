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
'use strict';

JSClass("CommunitySettingsWindowController", UIWindowController, {

    community: null,
    service: null,
    selectedSection: null,

    // MARK: - View Lifecycle

    viewDidLoad: function(){
        CommunitySettingsWindowController.$super.viewDidLoad.call(this);
        this.categories = [
            {title: JSBundle.mainBundle.localizedString("categories.general.title", "CommunitySettingsWindowController"), viewControllerSpec: "CommunityGeneralSettingsViewController"},
            {title: JSBundle.mainBundle.localizedString("categories.permissions.title", "CommunitySettingsWindowController"), viewControllerSpec: "CommunityPermissionsSettingsViewController"},
            {title: JSBundle.mainBundle.localizedString("categories.billing.title", "CommunitySettingsWindowController"), viewControllerSpec: "CommunityBillingSettingsViewController"}
        ];
        this.communitySaveSynchronizer = JSSynchronizer.initWithAction(this.saveCommunity, this);
        this.communitySaveSynchronizer.pendingInterval = 0;
        var selectedIndex = 0;
        if (this.selectedSection == "billing"){
            selectedIndex = 2;
        }
        this.showDetailsForCategory(this.categories[selectedIndex]);
        this.categoriesListView.selectedIndexPath = JSIndexPath(0, selectedIndex);
        this.categoriesListView.reloadData();
    },

    viewWillAppear: function(animated){
        CommunitySettingsWindowController.$super.viewWillAppear.call(this, animated);
    },

    viewDidAppear: function(animated){
        CommunitySettingsWindowController.$super.viewDidAppear.call(this, animated);
    },

    viewWillDisappear: function(animated){
        CommunitySettingsWindowController.$super.viewWillDisappear.call(this, animated);
        if (this.detailsViewController !== null){
            this.detailsViewController.viewWillDisappear(animated);
        }
    },

    viewDidDisappear: function(animated){
        CommunitySettingsWindowController.$super.viewDidDisappear.call(this, animated);
        if (this.detailsViewController !== null){
            this.detailsViewController.viewDidDisappear(animated);
        }
    },

    // MARK: - List View Data Source

    categories: null,
    categoriesListView: JSOutlet(),

    numberOfSectionsInListView: function(listView){
        return 1;
    },

    numberOfRowsInListViewSection: function(listView, sectionIndex){
        return this.categories.length;
    },

    cellForListViewAtIndexPath: function(listView, indexPath){
        var cell = listView.dequeueReusableCellWithIdentifier("category", indexPath);
        var category = this.categories[indexPath.row];
        cell.titleLabel.text = category.title;
        return cell;
    },

    listViewDidSelectCellAtIndexPath: function(listView, indexPath){
        var category = this.categories[indexPath.row];
        this.showDetailsForCategory(category);
    },

    // MARK: - Details View Controller

    detailsViewController: null,

    showDetailsForCategory: function(category){
        var previousViewController = this.detailsViewController;
        if (previousViewController !== null){
            previousViewController.viewWillDisappear(false);
            previousViewController.removeFromParentViewController();
            previousViewController.view.removeFromSuperview();
            previousViewController.viewDidDisappear(false);
        }
        var spec = JSSpec.initWithResource(category.viewControllerSpec);
        var viewController = spec.filesOwner;
        viewController.service = this.service;
        viewController.community = this.community;
        viewController.communitySaveSynchronizer = this.communitySaveSynchronizer;
        this.detailsViewController = viewController;
        viewController.viewWillAppear(false);
        this.addChildViewController(viewController);
        this.window.contentView.addSubview(viewController.view);
        this.view.setNeedsLayout();
        this.view.layoutIfNeeded();
        viewController.viewDidAppear(false);
    },

    // MARK: Saving

    communitySaveSynchronizer: null,
    syncIndicator: JSOutlet(),

    saveCommunity: function(syncContext){
        syncContext.started();
        this.service.saveCommunity(this.community.dictionaryRepresentation(), function(result){
            if (result !== Service.Result.success){
                syncContext.completed(new Error("Request failed"));
                return;
            }
            syncContext.completed();
        });
    },

    resync: function(){
        this.communitySaveSynchronizer.sync();
    },

    // MARK: - Layout

    viewDidLayoutSubviews: function(){
        var windowBounds = this.window.bounds;
        var bounds = this.window.contentView.bounds;
        var listWidth = 150;
        this.categoriesListView.frame = this.categoriesListView.superview.convertRectFromView(JSRect(0, 0, listWidth, windowBounds.size.height), this.window);
        this.categoriesListView.contentInsets = JSInsets(-this.categoriesListView.frame.origin.y + 20, 0, 0, 0);
        if (this.detailsViewController !== null){
            this.detailsViewController.view.frame = JSRect(listWidth, 0, bounds.size.width - listWidth, bounds.size.height);
        }
        var indicatorSize = this.syncIndicator.intrinsicSize;
        this.syncIndicator.frame = JSRect(this.window.bounds.size.width - 5 - indicatorSize.width, 5, indicatorSize.width, indicatorSize.height);
    }


});