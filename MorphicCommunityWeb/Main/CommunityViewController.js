// #import UIKit
// #import "Service+Extensions.js"
// #import "BarDetailViewController.js"
// #import "MemberDetailViewController.js"
'use strict';

(function(){

JSClass("CommunityViewController", UIListViewController, {

    mainViewController: null,

    service: null,
    defaults: null,

    communityId: null,
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
    },

    viewDidDisappear: function(animated){
        CommunityViewController.$super.viewDidDisappear.call(this, animated);
    },

    // MARK: - Data Loading

    community: null,
    members: null,
    bars: null,

    loadDetails: function(){
        this.showActivityIndicator();
        this.errorView.hidden = true;

        // First load the full community details
        this.service.loadCommunity(this.communityId, function(result, community){
            if (result !== Service.Result.success){
                this.hideActivityIndicator();
                this.errorView.hidden = false;
                return;
            }
            this.community = community;

            // Then simultaneously load the bars and members
            var remaining = 2;
            var loaded = function(){
                --remaining;
                if (remaining === 0){
                    this.navigationController.navigationBar.hidden = false;
                    this.hideActivityIndicator();
                    this.listView.reloadData();
                    this.listView.selectedIndexPath = JSIndexPath(0, 0);
                }
            };
            this.service.loadCommunityBars(this.community.id, function(result, page){
                if (result !== Service.Result.success){
                    this.hideActivityIndicator();
                    this.errorView.hidden = false;
                    return;
                }
                this.bars = page.bars;
                // Remove any bars that aren't shared
                var bar;
                for (var i = this.bars.length - 1; i >= 0; --i){
                    bar = this.bars[i];
                    if (!bar.is_shared){
                        this.bars.splice(i, 1);
                    }
                }
                // Sort bars...default first, then by name
                var defaultBarId = this.community.default_bar_id;
                this.bars.sort(function(a, b){
                    if (a.id === defaultBarId){
                        return -1;
                    }
                    if (b.id === defaultBarId){
                        return 1;
                    }
                    return a.name.localeCompare(b.name);
                });
                loaded.call(this);
            }, this);
            this.service.loadCommunityMembers(this.community.id, function(result, page){
                if (result !== Service.Result.success){
                    this.hideActivityIndicator();
                    this.errorView.hidden = false;
                    return;
                }
                this.members = page.members;
                // Cache each member's full name and then sort by it
                var member;
                for (var i = 0, l = this.members.length; i < l; ++i){
                    member = this.members[i];
                    member.full_name = fullNameFromParts(member.first_name, member.last_name);
                }
                this.members.sort(function(a, b){
                    return a.full_name.localeCompare(b.full_name);
                });
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
            header.titleLabel.text = JSBundle.mainBundle.localizedString("header.bars", "CommunityViewController");
            header.actionButton = this.addBarButton;
        }else{
            header.titleLabel.text = JSBundle.mainBundle.localizedString("header.members", "CommunityViewController");
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
        cell.titleLabel.text = member.full_name;
        cell.titleInsets.left = 34;
        return cell;
    },

    _skipNextSelection: false,

    listViewDidSelectCellAtIndexPath: function(listView, indexPath){
        if (this._skipNextSelection){
            this._skipNextSelection = false;
            return;
        }
        var viewController;
        if (indexPath.section === 0){
            var bar = this.bars[indexPath.row];
            viewController = BarDetailViewController.initWithSpecName("BarDetailViewController");
            viewController.service = this.service;
            viewController.community = this.community;
            viewController.delegate = this;
            viewController.bar = bar;
        }else{
            var member = this.members[indexPath.row];
            viewController = MemberDetailViewController.initWithSpecName("MemberDetailViewController");
            viewController.service = this.service;
            viewController.community = this.community;
            viewController.delegate = this;
            viewController.member = member;
        }
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

    barDetailViewControllerDidChangeBar: function(viewController, bar, replacingBar){
        var indexPath;
        if (replacingBar){
            indexPath = this.indexPathForBar(replacingBar);
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
        var defaultBarId = this.community.default_bar_id;
        var searcher = JSBinarySearcher(this.bars, function(a, b){
            if (a.id === defaultBarId){
                return -1;
            }
            if (b.id === defaultBarId){
                return 1;
            }
            return a.name.localeCompare(b.name);
        });
        var newIndex = searcher.insertionIndexForValue(barInList);
        this.bars.splice(newIndex, 0, barInList);
        if (newIndex === indexPath.row){
            this.listView.reloadRowAtIndexPath(indexPath);
        }else{
            var newIndexPath = JSIndexPath(0, newIndex);
            this.listView.deleteRowAtIndexPath(indexPath, UIListView.RowAnimation.left);
            this.listView.insertRowAtIndexPath(newIndexPath, UIListView.RowAnimation.left);
            this.listView.layoutIfNeeded();
            this._skipNextSelection = true;
            this.listView.selectedIndexPath = newIndexPath;
        }
    },

    barDetailViewControllerDidDeleteBar: function(viewController, bar){
        var indexPath = this.indexPathForBar(bar);
        if (indexPath === null){
            return;
        }
        this.bars.splice(indexPath.row, 1);
        this.listView.deleteRowAtIndexPath(indexPath, UIListView.RowAnimation.left);
        this.listView.layoutIfNeeded();
        this.listView.selectedIndexPath = JSIndexPath(0, indexPath.row < this.bars.length ? indexPath.row : indexPath.row - 1);
    },

    memberDetailViewControllerDidChangeMember: function(viewController, member, replacingMember){
        var indexPath;
        if (replacingMember){
            indexPath = this.indexPathForMember(replacingMember);
        }else{
            indexPath = this.indexPathForMember(member);
        }
        if (indexPath === null){
            return;
        }
        var memberInList = this.members[indexPath.row];
        this.members.splice(indexPath.row, 1);
        memberInList.id = member.id;
        memberInList.first_name = member.first_name;
        memberInList.last_name = member.last_name;
        memberInList.full_name = fullNameFromParts(member.first_name, member.last_name);
        var searcher = JSBinarySearcher(this.members, function(a, b){
            return a.full_name.localeCompare(b.full_name);
        });
        var newIndex = searcher.insertionIndexForValue(memberInList);
        this.members.splice(newIndex, 0, memberInList);
        if (newIndex === indexPath.row){
            this.listView.reloadRowAtIndexPath(indexPath);
        }else{
            var newIndexPath = JSIndexPath(1, newIndex);
            this.listView.deleteRowAtIndexPath(indexPath, UIListView.RowAnimation.left);
            this.listView.insertRowAtIndexPath(newIndexPath, UIListView.RowAnimation.left);
            this.listView.layoutIfNeeded();
            this._skipNextSelection = true;
            this.listView.selectedIndexPath = newIndexPath;
        }
    },

    memberDetailViewControllerDidDeleteMember: function(viewController, member){
        var indexPath = this.indexPathForMember(member);
        if (indexPath === null){
            return;
        }
        this.members.splice(indexPath.row, 1);
        this.listView.deleteRowAtIndexPath(indexPath, UIListView.RowAnimation.left);
        this.listView.layoutIfNeeded();
        this.listView.selectedIndexPath = JSIndexPath(1, indexPath.row < this.members.length ? indexPath.row : indexPath.row - 1);
    },

    // MARK: - Actions

    addBarButton: JSOutlet(),
    addMemberButton: JSOutlet(),

    addBar: function(){
        var bar = {
            id: null,
            name: "New Bar",
            is_shared: true,
            items: []
        };
        var indexPath = JSIndexPath(0, this.bars.length);
        this.bars.push(bar);
        this.listView.insertRowAtIndexPath(indexPath, UIListView.RowAnimation.left);
        this.listView.layoutIfNeeded();
        this.listView.selectedIndexPath = indexPath;
    },

    addMember: function(){
        var member = {
            id: null,
            first_name: null,
            last_name: null,
            role: "member",
            state: "uninvited",
            full_name: "New Member"
        };
        var indexPath = JSIndexPath(1, this.members.length);
        this.members.push(member);
        this.listView.insertRowAtIndexPath(indexPath, UIListView.RowAnimation.left);
        this.listView.layoutIfNeeded();
        this.listView.selectedIndexPath = indexPath;
    },

    // MARK: - Layout

    errorView: JSOutlet(),
    watermarkView: JSOutlet(),

    viewDidLayoutSubviews: function(){
        var bounds =this.view.bounds;
        this.listView.frame = bounds;
        var maxSize = bounds.rectWithInsets(JSInsets(20)).size;
        this.errorView.sizeToFitSize(maxSize);
        var center = bounds.center;
        this.activityIndicator.position = center;
        this.errorView.position = center;
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

var fullNameFromParts = function(first, last){
    if (first === null || first === ""){
        if (last === null || last === ""){
            return "";
        }
        return last;
    }
    if (last === null || last === ""){
        return first;
    }
    return first + " " + last;
};

})();