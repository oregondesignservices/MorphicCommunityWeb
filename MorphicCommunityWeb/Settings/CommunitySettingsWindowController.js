// #import UIKit
'use strict';

JSClass("CommunitySettingsWindowController", UIWindowController, {

    community: null,
    service: null,

    // MARK: - View Lifecycle

    viewDidLoad: function(){
        CommunitySettingsWindowController.$super.viewDidLoad.call(this);
        this.categories = [
            {title: JSBundle.mainBundle.localizedString("categories.general.title", "CommunitySettingsWindowController"), viewControllerSpec: "CommunityGeneralSettingsViewController"},
            {title: JSBundle.mainBundle.localizedString("categories.permissions.title", "CommunitySettingsWindowController"), viewControllerSpec: "CommunityPermissionsSettingsViewController"},
            {title: JSBundle.mainBundle.localizedString("categories.billing.title", "CommunitySettingsWindowController"), viewControllerSpec: "CommunityBillingSettingsViewController"}
        ];
        this.showDetailsForCategory(this.categories[0]);
        this.categoriesListView.selectedIndexPath = JSIndexPath(0, 0);
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
        this.detailsViewController = viewController;
        viewController.viewWillAppear(false);
        this.addChildViewController(viewController);
        this.window.contentView.addSubview(viewController.view);
        this.view.setNeedsLayout();
        this.view.layoutIfNeeded();
        viewController.viewDidAppear(false);
    },

    // MARK: - Layout

    viewDidLayoutSubviews: function(){
        var bounds = this.window.contentView.bounds;
        var listWidth = 150;
        this.categoriesListView.frame = JSRect(10, 20, listWidth - 20, bounds.size.height - 30);
        if (this.detailsViewController !== null){
            this.detailsViewController.view.frame = JSRect(listWidth, 20, bounds.size.width - listWidth - 10, bounds.size.height - 20);
        }
    }


});