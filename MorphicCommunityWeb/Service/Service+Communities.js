// #import "Service.js"
'use strict';

Service.definePropertiesFromExtensions({

    createCommunity: function(community, completion, target){
        var url = this.baseURL.appendingPathComponents([this.version, "communities"]);
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
    }

});