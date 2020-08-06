// #import UIKit
// #import "Member.js"
// #import "Service+Extensions.js"
'use strict';

JSClass("CommunityPermissionsSettingsViewController", UIViewController, {

    service: null,
    community: null,
    members: null,
    communitySaveSynchronizer: null,

    // MARK: - View Lifecycle

    viewDidLoad: function(){
        CommunityPermissionsSettingsViewController.$super.viewDidLoad.call(this);
        this._savingByMemberIndex = {};
        this.members = JSCopy(this.community.members);
        this.members.sort(Member.fullNameComparison);
        this.listView.reloadData();
    },

    viewWillAppear: function(animated){
        CommunityPermissionsSettingsViewController.$super.viewWillAppear.call(this, animated);
    },

    viewDidAppear: function(animated){
        CommunityPermissionsSettingsViewController.$super.viewDidAppear.call(this, animated);
    },

    viewWillDisappear: function(animated){
        CommunityPermissionsSettingsViewController.$super.viewWillDisappear.call(this, animated);
    },

    viewDidDisappear: function(animated){
        CommunityPermissionsSettingsViewController.$super.viewDidDisappear.call(this, animated);
    },

    // MARK: - List View Data Source

    listView: JSOutlet(),

    numberOfSectionsInListView: function(listView){
        return 1;
    },

    numberOfRowsInListViewSection: function(listView, sectionIndex){
        return this.members.length;
    },

    headerViewForListViewSection: function(listView, section){
        var header = listView.dequeueReusableHeaderWithIdentifier("header", section);
        header.titleLabel.text = "Member Name";
        header.columnLabel.text = "Manager";
        header.titleInsets.left = 20;
        return header;
    },

    cellForListViewAtIndexPath: function(listView, indexPath){
        var cell = listView.dequeueReusableCellWithIdentifier("member", indexPath);
        var member = this.members[indexPath.row];
        cell.titleLabel.text = member.fullName;
        cell.titleInsets.left = 20;
        cell.checkbox.on = member.role === Member.Role.manager;
        cell.checkbox.target = this;
        cell.checkbox.enabled = !this._savingByMemberIndex[indexPath.row];
        cell.checkbox.removeAllActions();
        cell.checkbox.addAction(function(checkbox){
            var role = checkbox.on ? Member.Role.manager : Member.Role.member;
            // Disable the checkbox so we can't save the same member more than
            // once at a time
            checkbox.enabled = false;
            this.saveRoleForMemberAtIndex(role, indexPath.row, function(role, memberIndex){
                // important to make sure we get the cell that currently represents the
                // member, because it may have changed or disappeared if the user scrolled
                // during the save process.
                var cell = listView.cellAtIndexPath(JSIndexPath(0, memberIndex));
                if (cell !== null){
                    cell.checkbox.on = role === Member.Role.manager;
                    cell.checkbox.enabled = true;
                }
            }, this);
        }, this);
        return cell;
    },

    listViewShouldSelectCellAtIndexPath: function(listView, indexPath){
        return false;
    },

    _savingByMemberIndex: null,

    saveRoleForMemberAtIndex: function(role, memberIndex, completion, target){
        var member = this.members[memberIndex];
        this._savingByMemberIndex[memberIndex] = true;
        // We'll load the member to ensure we get the full record before saving, otherwise 
        // saving an incomplete record could clear out fields we don't want to change.
        // Not ideal, but ok for a low-frequency operation like making someone a manager
        this.service.loadCommunityMember(this.community.id, member.id, function(result, fullMember){
            if (result !== Service.Result.success){
                this._savingByMemberIndex[memberIndex] = false;
                completion.call(target, member.role, memberIndex);
                return;
            }
            fullMember.role = role;
            this.service.saveCommunityMember(this.community.id, fullMember, function(result){
                this._savingByMemberIndex[memberIndex] = false;
                if (result === Service.Result.success){
                    member.role = role;
                }
                completion.call(target, member.role, memberIndex);
            }, this);
        }, this);
    },

    viewDidLayoutSubviews: function(){
        this.listView.frame = this.view.bounds.rectWithInsets(15,0,0,0);
    }

});

JSClass("CommunityPermissionsMemberCell", UIListViewCell, {

    checkbox: null,

    initWithReuseIdentifier: function(reuseIdentifier){
        CommunityPermissionsMemberCell.$super.initWithReuseIdentifier.call(this, reuseIdentifier);
        this.checkbox = UICheckbox.init();
        this.contentView.addSubview(this.checkbox);
    },

    layoutSubviews: function(){
        CommunityPermissionsMemberCell.$super.layoutSubviews.call(this);
        this.checkbox.sizeToFit();
        this.checkbox.position = JSPoint(this.contentView.bounds.size.width - this.checkbox.bounds.size.width - 20, this.contentView.bounds.center.y);
        this.titleLabel.frame = JSRect(this.titleLabel.frame.origin, JSSize(this.checkbox.frame.origin.x - this.titleLabel.frame.origin.x, this.titleLabel.frame.size.height));
    }

});

JSClass("CommunityPermissionsHeaderView", UIListViewHeaderFooterView, {

    columnLabel: null,

    initWithReuseIdentifier: function(reuseIdentifier){
        CommunityPermissionsHeaderView.$super.initWithReuseIdentifier.call(this, reuseIdentifier);
        this.columnLabel = UILabel.init();
        this.columnLabel.font = JSFont.systemFontOfSize(JSFont.Size.normal).fontWithWeight(JSFont.Weight.regular);
        this.contentView.addSubview(this.columnLabel);
    },

    layoutSubviews: function(){
        CommunityPermissionsHeaderView.$super.layoutSubviews.call(this);
        this.columnLabel.sizeToFit();
        this.columnLabel.position = JSPoint(this.contentView.bounds.size.width - this.columnLabel.bounds.size.width, this.titleLabel.position.y);
    }

});