// #import Foundation
// #import "Bar.js"
// #import "Member.js"
'use strict';

JSClass("Community", JSObject, {

    initWithDictionary: function(dictionary){
        this.id = dictionary.id;
        this.name = dictionary.name;
        this.defaultBarId = dictionary.default_bar_id;
        this.bars = [];
        this.members = [];
        this.barSearcher = JSBinarySearcher(this.bars, function(a, b){
            return a.id.localeCompare(b.id);
        });
        this.memberSearcher = JSBinarySearcher(this.members, function(a, b){
            return a.id.localeCompare(b.id);
        });
    },

    dictionaryRepresentation: function(){
        return {
            id: this.id,
            name: this.name,
            default_bar_id: this.defaultBarId
        };
    },

    id: null,
    defaultBarId: null,
    name: null,
    members: null,
    bars: null,

    memberForId: function(id){
        return this.memberSearcher.itemMatchingValue({id: id});
    },

    barForId: function(id){
        return this.barSearcher.itemMatchingValue({id: id});
    },

    setBarDictionaries: function(barDictionaries){
        var dictionary;
        var bar;
        for (var i = 0, l = barDictionaries.length; i < l; ++i){
            dictionary = barDictionaries[i];
            bar = Bar.initWithDictionary(dictionary);
            this._addBar(bar);
        }
    },

    _addBar: function(bar){
        var index = this.barSearcher.insertionIndexForValue(bar);
        this.bars.splice(index, 0, bar);
    },

    addBar: function(bar){
        // Only store the minimal set of fields so we don't waste memory
        var copy = Bar.init();
        copy.id = bar.id;
        copy.name = bar.name;
        copy.shared = bar.shared;
        this._addBar(copy);
    },

    updateBar: function(bar){
        var index = this.barSearcher.indexMatchingValue(bar);
        if (index === null){
            return;
        }
        var barInList = this.bars[index];
        barInList.name = bar.name;
    },

    removeBar: function(bar){
        var index = this.barSearcher.indexMatchingValue(bar);
        if (index !== null){
            this.bars.splice(index, 1);
        }
    },

    setMemberDictionaries: function(memberDictionaries){
        var dictionary;
        var member;
        for (var i = 0, l = memberDictionaries.length; i < l; ++i){
            dictionary = memberDictionaries[i];
            member = Member.initWithDictionary(dictionary);
            this._addMember(member);
        }
    },

    _addMember: function(member){
        var index = this.memberSearcher.insertionIndexForValue(member);
        this.members.splice(index, 0, member);
    },

    addMember: function(member){
        // Only store the minimal set of fields so we don't waste memory
        var copy = Member.init();
        copy.id = member.id;
        copy.firstName = member.firstName;
        copy.lastName = member.lastName;
        this._addMember(copy);
    },

    updateMember: function(member){
        var index = this.memberSearcher.indexMatchingValue(member);
        if (index === null){
            return;
        }
        var memberInList = this.members[index];
        memberInList.firstName = member.firstName;
        memberInList.lastName = member.lastName;
    },

    removeMember: function(member){
        var index = this.memberSearcher.indexMatchingValue(member);
        if (index !== null){
            this.members.splice(index, 1);
        }
    },

    barComparison: function(){
        var defaultBarId = this.defaultBarId;
        return function(a, b){
            if (a.id === defaultBarId){
                return -1;
            }
            if (b.id === defaultBarId){
                return 1;
            }
            return Bar.nameComparison(a, b);
        };
    }

});

Community.Notification = {
    barChanged: "org.raisingthefloor.CommunityBarChangedNotification",
    barDeleted: "org.raisingthefloor.CommunityBarDeletedNotification",
    memberChanged: "org.raisingthefloor.CommunityMemberChangedNotification",
    memberDeleted: "org.raisingthefloor.CommunityMemberDeletedNotification"
};