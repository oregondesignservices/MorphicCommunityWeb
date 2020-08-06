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

// #import "Service.js"
'use strict';

Service.definePropertiesFromExtensions({

    createCommunity: function(community, completion, target){
        var url = this.baseURL.appendingPathComponents([this.version, "communities"]);
        var query = JSFormFieldMap();
        query.add("populate_default_bars");
        url.query = query;
        var request = JSURLRequest.initWithURL(url);
        request.method = JSURLRequest.Method.post;
        request.object = {
            name: community.name
        };
        request.addBearerAuthorization(this.authToken);
        return this.sendRequest(request, completion, target);
    },

    loadCommunities: function(completion, target){
        var url = this.baseURL.appendingPathComponents([this.version, "users", this.user.id, "communities"]);
        var request = JSURLRequest.initWithURL(url);
        request.addBearerAuthorization(this.authToken);
        return this.sendRequest(request, completion, target);
    },

    loadCommunity: function(communityId, completion, target){
        var url = this.baseURL.appendingPathComponents([this.version, "communities", communityId]);
        var request = JSURLRequest.initWithURL(url);
        request.addBearerAuthorization(this.authToken);
        return this.sendRequest(request, completion, target);
    },

    saveCommunity: function(community, completion, target){
        var url = this.baseURL.appendingPathComponents([this.version, "communities", community.id]);
        var request = JSURLRequest.initWithURL(url);
        request.method = JSURLRequest.Method.put;
        request.object = community;
        request.addBearerAuthorization(this.authToken);
        return this.sendRequest(request, completion, target);
    },

    loadCommunityMembers: function(communityId, completion, target){
        var url = this.baseURL.appendingPathComponents([this.version, "communities", communityId, "members"]);
        var request = JSURLRequest.initWithURL(url);
        request.addBearerAuthorization(this.authToken);
        return this.sendRequest(request, completion, target);
    },

    loadCommunityMember: function(communityId, memberId, completion, target){
        var url = this.baseURL.appendingPathComponents([this.version, "communities", communityId, "members", memberId]);
        var request = JSURLRequest.initWithURL(url);
        request.addBearerAuthorization(this.authToken);
        return this.sendRequest(request, completion, target);        
    },

    createCommunityMember: function(communityId, member, completion, target){
        var url = this.baseURL.appendingPathComponents([this.version, "communities", communityId, "members"]);
        var request = JSURLRequest.initWithURL(url);
        request.method = JSURLRequest.Method.post;
        request.addBearerAuthorization(this.authToken);
        request.object = member;
        return this.sendRequest(request, completion, target);      
    },

    saveCommunityMember: function(communityId, member, completion, target){
        var url = this.baseURL.appendingPathComponents([this.version, "communities", communityId, "members", member.id]);
        var request = JSURLRequest.initWithURL(url);
        request.method = JSURLRequest.Method.put;
        request.addBearerAuthorization(this.authToken);
        request.object = member;
        return this.sendRequest(request, completion, target);
    },

    deleteCommunityMember: function(communityId, memberId, completion, target){
        var url = this.baseURL.appendingPathComponents([this.version, "communities", communityId, "members", memberId]);
        var request = JSURLRequest.initWithURL(url);
        request.method = JSURLRequest.Method.delete;
        request.addBearerAuthorization(this.authToken);
        return this.sendRequest(request, completion, target);
    },

    loadCommunityBars: function(communityId, completion, target){
        var url = this.baseURL.appendingPathComponents([this.version, "communities", communityId, "bars"]);
        var request = JSURLRequest.initWithURL(url);
        request.addBearerAuthorization(this.authToken);
        return this.sendRequest(request, completion, target);
    },

    loadCommunityBar: function(communityId, barId, completion, target){
        var url = this.baseURL.appendingPathComponents([this.version, "communities", communityId, "bars", barId]);
        var request = JSURLRequest.initWithURL(url);
        request.addBearerAuthorization(this.authToken);
        return this.sendRequest(request, completion, target);        
    },

    createCommunityBar: function(communityId, bar, completion, target){
        var url = this.baseURL.appendingPathComponents([this.version, "communities", communityId, "bars"]);
        var request = JSURLRequest.initWithURL(url);
        request.method = JSURLRequest.Method.post;
        request.addBearerAuthorization(this.authToken);
        request.object = bar;
        return this.sendRequest(request, completion, target);      
    },

    saveCommunityBar: function(communityId, bar, completion, target){
        var url = this.baseURL.appendingPathComponents([this.version, "communities", communityId, "bars", bar.id]);
        var request = JSURLRequest.initWithURL(url);
        request.method = JSURLRequest.Method.put;
        request.addBearerAuthorization(this.authToken);
        request.object = bar;
        return this.sendRequest(request, completion, target);
    },

    deleteCommunityBar: function(communityId, barId, completion, target){
        var url = this.baseURL.appendingPathComponents([this.version, "communities", communityId, "bars", barId]);
        var request = JSURLRequest.initWithURL(url);
        request.method = JSURLRequest.Method.delete;
        request.addBearerAuthorization(this.authToken);
        return this.sendRequest(request, completion, target);
    },

    sendCommunityInvitation: function(communityId, invite, completion, target){
        var url = this.baseURL.appendingPathComponents([this.version, "communities", communityId, "invitations"]);
        var request = JSURLRequest.initWithURL(url);
        request.method = JSURLRequest.Method.post;
        request.object = invite;
        request.addBearerAuthorization(this.authToken);
        return this.sendRequest(request, completion, target);

    },

    createSkypeMeeting: function(communityId, title, completion, target){
        var url = this.baseURL.appendingPathComponents([this.version, "communities", communityId, "skype", "meetings"]);
        var request = JSURLRequest.initWithURL(url);
        request.method = JSURLRequest.Method.post;
        request.object = {"Title": title};
        request.addBearerAuthorization(this.authToken);
        return this.sendRequest(request, completion, target);
    }

});