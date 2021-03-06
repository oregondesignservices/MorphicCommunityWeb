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
// #import "BarDetailViewController.js"
// #import "MemberDetailViewController.js"
// #import "Community.js"
// #import "CommunitySettingsWindowController.js"
// #import "PlanUpgradeViewController.js"
'use strict';

(function(){

JSClass("CommunityViewController", UIListViewController, {

    mainViewController: null,

    service: null,

    partialCommunity: null,
    startingActivityAnimationPercentComplete: 0,

    // MARK: - View Lifecycle

    viewDidLoad: function(){
        CommunityViewController.$super.viewDidLoad.call(this);
    },

    viewWillAppear: function(animated){
        CommunityViewController.$super.viewWillAppear.call(this, animated);
        this.loadDetails();
    },

    viewDidAppear: function(animated){
        CommunityViewController.$super.viewDidAppear.call(this, animated);
    },

    viewWillDisappear: function(animated){
        CommunityViewController.$super.viewWillDisappear.call(this, animated);
        this.stopListeningForCommunityNotifications();
        this.closeAllWinodows();
    },

    viewDidDisappear: function(animated){
        CommunityViewController.$super.viewDidDisappear.call(this, animated);
    },

    // MARK: - Data Loading

    community: null,
    bars: null,
    members: null,

    loadDetails: function(){
        this.showActivityIndicator();
        this.errorView.hidden = true;

        // First load the full community details
        this.service.loadCommunity(this.partialCommunity.id, function(result, community){
            if (result !== Service.Result.success){
                this.hideActivityIndicator();
                this.errorView.hidden = false;
                return;
            }
            this.community = Community.initWithDictionary(community);

            // Then simultaneously load the bars and members
            var remaining = 2;
            var loaded = function(){
                --remaining;
                if (remaining === 0){
                    this.startListeningForCommunityNotifications();
                    this.navigationController.navigationBar.hidden = false;
                    this.hideActivityIndicator();
                    if (this.community.locked){
                        this.bars = [];
                        this.members = [];
                        this.lockedView.hidden = false;
                    }else{
                        this.listView.reloadData();
                        if (this.bars.length > 0){
                            this.listView.selectedIndexPath = JSIndexPath(0, 0);
                            this.showBarDetail(this.bars[0]);
                        }else if (this.members.length > 0){
                            this.listView.selectedIndexPath = JSIndexPath(1, 0);
                            this.showMemberDetail(this.members[0]);
                        }
                    }
                }
            };
            this.service.loadCommunityBars(this.community.id, function(result, page){
                if (result !== Service.Result.success){
                    this.hideActivityIndicator();
                    this.errorView.hidden = false;
                    return;
                }
                this.community.setBarDictionaries(page.bars);
                // Only show shared bars in the sidebar list
                this.bars = [];
                var bar;
                for (var i = 0, l = this.community.bars.length; i < l; ++i){
                    bar = this.community.bars[i];
                    if (bar.shared){
                        this.bars.push(bar);
                    }
                }
                this.bars.sort(this.community.barComparison());
                loaded.call(this);
            }, this);
            this.service.loadCommunityMembers(this.community.id, function(result, page){
                if (result !== Service.Result.success){
                    this.hideActivityIndicator();
                    this.errorView.hidden = false;
                    return;
                }
                this.community.setMemberDictionaries(page.members);
                this.members = JSCopy(this.community.members);
                this.members.sort(Member.fullNameComparison);
                loaded.call(this);
            }, this);
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
        this.activityFadeInAnimation.percentComplete = this.startingActivityAnimationPercentComplete;
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
        if (this.community === null){
            return 0;
        }
        return 2;
    },

    numberOfRowsInListViewSection: function(listView, sectionIndex){
        if (sectionIndex === 0){
            return this.bars.length;
        }
        return this.members.length;
    },

    headerViewForListViewSection: function(listView, sectionIndex){
        var header = listView.dequeueReusableHeaderWithIdentifier("header", sectionIndex);
        if (sectionIndex === 0){
            header.titleLabel.text = this.localizedString("header.bars");
            header.actionButton = this.addBarButton;
        }else{
            header.titleLabel.text = this.localizedString("header.members");
            header.actionButton = this.addMemberButton;
        }
        header.titleInsets.left = 34;
        header.titleInsets.right = 31;
        return header;
    },

    cellForListViewAtIndexPath: function(listView, indexPath){
        var cell;
        if (indexPath.section === 0){
            cell = listView.dequeueReusableCellWithIdentifier("bar", indexPath);
            var bar = this.bars[indexPath.row];
            cell.titleLabel.text = bar.name;
            cell.titleInsets.left = 34;
            return cell;
        }
        cell = listView.dequeueReusableCellWithIdentifier("member", indexPath);
        var member = this.members[indexPath.row];
        cell.titleLabel.text = member.fullName;
        cell.titleInsets.left = 34;
        return cell;
    },

    listViewDidSelectCellAtIndexPath: function(listView, indexPath){
        if (indexPath.section === 0){
            var bar = this.bars[indexPath.row];
            this.showBarDetail(bar);
        }else{
            var member = this.members[indexPath.row];
            this.showMemberDetail(member);
        }
    },

    showBarDetail: function(bar){
        var viewController = BarDetailViewController.initWithSpecName("BarDetailViewController");
        viewController.service = this.service;
        viewController.community = this.community;
        viewController.bar = bar;
        this.mainViewController.mainViewController = viewController;
    },

    showMemberDetail: function(member){
        var viewController = MemberDetailViewController.initWithSpecName("MemberDetailViewController");
        viewController.service = this.service;
        viewController.community = this.community;
        viewController.member = member;
        this.mainViewController.mainViewController = viewController;
    },

    indexPathForMember: function(member){
        var index;
        if (member.id === null){
            for (index = this.members.length - 1; index >= 0; --index){
                if (member === this.members[index]){
                    return JSIndexPath(1, index);
                }
            }
            return null;
        }
        for (index = this.members.length - 1; index >= 0; --index){
            if (member.id === this.members[index].id){
                return JSIndexPath(1, index);
            }
        }
        return null;
    },

    indexPathForBar: function(bar){
        var index;
        if (bar.id === null){
            for (index = this.bars.length - 1; index >= 0; --index){
                if (bar === this.bars[index]){
                    return JSIndexPath(0, index);
                }
            }
            return null;
        }
        for (index = this.bars.length - 1; index >= 0; --index){
            if (bar.id === this.bars[index].id){
                return JSIndexPath(0, index);
            }
        }
        return null;
    },

    // MARK: - Notifications

    barChangedNotificationId: null,
    barDeletedNotificationId: null,
    memberChangedNotificationId: null,
    memberDeletedNotificationId: null,
    defaultBarChangedNotificationId: null,

    startListeningForCommunityNotifications: function(){
        this.stopListeningForCommunityNotifications();
        this.barChangedNotificationId = this.service.notificationCenter.addObserver(Community.Notification.barChanged, this.community, this.handleBarChanged, this);
        this.barDeletedNotificationId = this.service.notificationCenter.addObserver(Community.Notification.barDeleted, this.community, this.handleBarDeleted, this);
        this.memberChangedNotificationId = this.service.notificationCenter.addObserver(Community.Notification.memberChanged, this.community, this.handleMemberChanged, this);
        this.memberDeletedNotificationId = this.service.notificationCenter.addObserver(Community.Notification.memberDeleted, this.community, this.handleMemberDeleted, this);
        this.defaultBarChangedNotificationId = this.service.notificationCenter.addObserver(Community.Notification.defaultBarChanged, this.community, this.handleDefaultBarChanged, this);
    },

    stopListeningForCommunityNotifications: function(){
        if (this.barChangedNotificationId !== null){
            this.service.notificationCenter.removeObserver(Community.Notification.barChanged, this.barChangedNotificationId);
            this.barChangedNotificationId = null;
        }
        if (this.barDeletedNotificationId !== null){
            this.service.notificationCenter.removeObserver(Community.Notification.barDeleted, this.barDeletedNotificationId);
            this.barDeletedNotificationId = null;
        }
        if (this.memberChangedNotificationId !== null){
            this.service.notificationCenter.removeObserver(Community.Notification.memberChanged, this.memberChangedNotification);
            this.memberChangedNotificationId = null;
        }
        if (this.memberDeletedNotificationId !== null){
            this.service.notificationCenter.removeObserver(Community.Notification.memberDeleted, this.memberDeletedNotification);
            this.memberDeletedNotificationId = null;
        }
        if (this.defaultBarChangedNotificationId !== null){
            this.service.notificationCenter.removeObserver(Community.Notification.handleDefaultBarChanged, this.defaultBarChangedNotificationId);
            this.defaultBarChangedNotificationId = null;
        }
    },

    handleDefaultBarChanged: function(){
        var removingIndexPath1 = JSIndexPath(0, 0);
        var removingIndexPath2 = JSIndexPath(this.listView.selectedIndexPath);
        var insertingIndexPath1 = JSIndexPath(0, 0);

        var oldDefaultBar = this.bars[removingIndexPath1.row];
        var newDefaultBar = this.bars[removingIndexPath2.row];

        this.bars.splice(removingIndexPath2.row, 1);
        this.bars.splice(removingIndexPath1.row, 1, newDefaultBar);

        var searcher = JSBinarySearcher(this.bars, this.community.barComparison());
        var newIndex = searcher.insertionIndexForValue(oldDefaultBar);
        var insertingIndexPath2 = JSIndexPath(0, newIndex);
        this.bars.splice(newIndex, 0, oldDefaultBar);

        this.listView.deleteRowsAtIndexPaths([removingIndexPath1, removingIndexPath2], UIListView.RowAnimation.left);
        this.listView.insertRowsAtIndexPaths([insertingIndexPath1, insertingIndexPath2], UIListView.RowAnimation.left);
        this.listView.layoutIfNeeded();
        this.listView.selectedIndexPath = insertingIndexPath1;
    },

    handleBarChanged: function(notification){
        var bar = notification.userInfo.bar;
        var replacedBar = notification.userInfo.replacedBar;
        var indexPath;
        if (replacedBar){
            indexPath = this.indexPathForBar(replacedBar);
        }else{
            indexPath = this.indexPathForBar(bar);
        }
        if (indexPath === null){
            return;
        }
        var barInList = this.bars[indexPath.row];
        this.bars.splice(indexPath.row, 1);
        barInList.id = bar.id;
        barInList.name = bar.name;
        var searcher = JSBinarySearcher(this.bars, this.community.barComparison());
        var newIndex = searcher.insertionIndexForValue(barInList);
        this.bars.splice(newIndex, 0, barInList);
        if (newIndex === indexPath.row){
            this.listView.reloadRowAtIndexPath(indexPath);
        }else{
            var newIndexPath = JSIndexPath(0, newIndex);
            this.listView.deleteRowAtIndexPath(indexPath, UIListView.RowAnimation.left);
            this.listView.insertRowAtIndexPath(newIndexPath, UIListView.RowAnimation.left);
            this.listView.layoutIfNeeded();
            this.listView.selectedIndexPath = newIndexPath;
        }
    },

    handleBarDeleted: function(notification){
        var bar = notification.userInfo.bar;
        var indexPath = this.indexPathForBar(bar);
        if (indexPath === null){
            return;
        }
        this.bars.splice(indexPath.row, 1);
        this.listView.deleteRowAtIndexPath(indexPath, UIListView.RowAnimation.left);
        this.listView.layoutIfNeeded();
        this.listView.selectedIndexPath = JSIndexPath(0, indexPath.row < this.bars.length ? indexPath.row : indexPath.row - 1);
        this.showBarDetail(this.bars[this.listView.selectedIndexPath.row]);
    },

    handleMemberChanged: function(notification){
        var member = notification.userInfo.member;
        var replacedMember = notification.userInfo.replacedMember;
        var indexPath;
        if (replacedMember){
            indexPath = this.indexPathForMember(replacedMember);
        }else{
            indexPath = this.indexPathForMember(member);
        }
        if (indexPath === null){
            return;
        }
        var memberInList = this.members[indexPath.row];
        this.members.splice(indexPath.row, 1);
        memberInList.id = member.id;
        memberInList.firstName = member.firstName;
        memberInList.lastName = member.lastName;
        memberInList.placeholderName = "";
        var searcher = JSBinarySearcher(this.members, Member.fullNameComparison);
        var newIndex = searcher.insertionIndexForValue(memberInList);
        this.members.splice(newIndex, 0, memberInList);
        if (newIndex === indexPath.row){
            this.listView.reloadRowAtIndexPath(indexPath);
        }else{
            var newIndexPath = JSIndexPath(1, newIndex);
            this.listView.deleteRowAtIndexPath(indexPath, UIListView.RowAnimation.left);
            this.listView.insertRowAtIndexPath(newIndexPath, UIListView.RowAnimation.left);
            this.listView.layoutIfNeeded();
            this.listView.selectedIndexPath = newIndexPath;
        }
    },

    handleMemberDeleted: function(notification){
        var member = notification.userInfo.member;
        var indexPath = this.indexPathForMember(member);
        if (indexPath === null){
            return;
        }
        this.members.splice(indexPath.row, 1);
        this.listView.deleteRowAtIndexPath(indexPath, UIListView.RowAnimation.left);
        this.listView.layoutIfNeeded();
        this.listView.selectedIndexPath = JSIndexPath(1, indexPath.row < this.members.length ? indexPath.row : indexPath.row - 1);
        this.showMemberDetail(this.members[this.listView.selectedIndexPath.row]);
    },

    // MARK: - Actions

    addBarButton: JSOutlet(),
    addMemberButton: JSOutlet(),

    addBar: function(){
        var bar = Bar.init();
        bar.name = "New Bar";
        bar.shared = true;
        var indexPath = JSIndexPath(0, this.bars.length);
        this.bars.push(bar);
        this.listView.insertRowAtIndexPath(indexPath, UIListView.RowAnimation.left);
        this.listView.layoutIfNeeded();
        this.listView.selectedIndexPath = indexPath;
        this.showBarDetail(bar);
    },

    addMember: function(sender){
        if (this.community.memberLimit > 0 && this.community.memberCount == this.community.memberLimit){
            this.promptForUpgrade(sender);
            return;
        }
        var member = Member.init();
        member.role = Member.Role.member;
        member.state = Member.State.uninvited;
        member.placeholderName = "New Member";
        var indexPath = JSIndexPath(1, this.members.length);
        this.members.push(member);
        this.listView.insertRowAtIndexPath(indexPath, UIListView.RowAnimation.left);
        this.listView.layoutIfNeeded();
        this.listView.selectedIndexPath = indexPath;
        this.showMemberDetail(member);
    },

    upgradeViewController: null,

    promptForUpgrade: function(sender){
        if (this.upgradeViewController === null){
            this.upgradeViewController = PlanUpgradeViewController.initWithSpecName("PlanUpgradeViewController");
            this.upgradeViewController.delegate = this;
            this.upgradeViewController.community = this.community;
            this.upgradeViewController.service = this.service;
        }
        this.upgradeViewController.popupAdjacentToView(sender, UIPopupWindow.Placement.below);
    },

    planUpgradeViewDidDismiss: function(upgradeViewController){
        if (upgradeViewController === this.upgradeViewController){
            this.upgradeViewController.delegate = null;
            this.upgradeViewController = null;
        }
    },

    planUpgradeViewDidUpgrade: function(upgradeViewController){
        this.addMember(this.addMemberButton);
    },

    planUpgradeViewShowBilling: function(upgradeViewController){
        this.openSettings(this.navigationController.navigationBar.stylerProperties.rightBarItemViews[0], "billing");
    },

    settingsWindowController: null,

    openSettings: function(sender, section){
        if (!this.settingsWindowController){
            this.settingsWindowController = CommunitySettingsWindowController.initWithSpecName("CommunitySettingsWindowController");
            this.settingsWindowController.service = this.service;
            this.settingsWindowController.community = this.community;
            this.settingsWindowController.delegate = this;
            this.settingsWindowController.selectedSection = section || null;
            this.settingsWindowController.prepareWindowIfNeeded();
            var window = this.settingsWindowController.window;
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
        this.settingsWindowController.makeKeyAndOrderFront();
    },

    showBilling: function(sender){
        this.openSettings(sender, "billing");
    },

    windowControllerDidClose: function(windowController){
        if (windowController === this.settingsWindowController){
            this.settingsWindowController = null;
            this.navigationItem.title = this.community.name;
            this.partialCommunity.name = this.community.name;
        }
    },

    closeAllWinodows: function(){
        if (this.upgradeViewController !== null){
            this.upgradeViewController.dismiss();
        }
        if (this.settingsWindowController !== null){
            this.settingsWindowController.close();
        }
    },

    // MARK: - Layout

    lockedView: JSOutlet(),
    errorView: JSOutlet(),
    watermarkView: JSOutlet(),

    viewDidLayoutSubviews: function(){
        var bounds =this.view.bounds;
        this.listView.frame = bounds;
        var maxSize = bounds.rectWithInsets(JSInsets(20)).size;
        this.errorView.sizeToFitSize(maxSize);
        this.lockedView.sizeToFitSize(maxSize);
        var center = bounds.center;
        this.activityIndicator.position = center;
        this.errorView.position = center;
        this.lockedView.position = center;
        this.watermarkView.bounds = JSRect(0, 0, bounds.size.width, bounds.size.width);
        this.watermarkView.position = JSPoint(bounds.center.x, bounds.size.height - 125 + bounds.size.width / 2.0); 
    }

});

JSClass("CommunityListHeaderView", UIListViewHeaderFooterView, {

    actionButton: JSDynamicProperty('_actionButton', null),

    setActionButton: function(actionButton){
        this._actionButton = actionButton;
        if (actionButton !== null && actionButton.superview !== this){
            this.addSubview(actionButton);
        }
        this.setNeedsLayout();
    },

    layoutSubviews: function(){
        CommunityListHeaderView.$super.layoutSubviews.call(this);
        if (this._actionButton !== null){
            this._actionButton.position = JSPoint(this.bounds.size.width - 7 - this._actionButton.bounds.size.width / 2, this.bounds.center.y);
        }
    }

});

JSClass("StackedButton", UIButton, {

    sizeToFitSize: function(maxSize){
        this.styler.sizeControlToFitSize(this, JSSize(maxSize.width, this.intrinsicSize.height));
    }

});

})();