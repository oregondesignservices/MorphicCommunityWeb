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

    loadCommunityBars: function(communityId, completion, target){
        var url = this.baseURL.appendingPathComponents([this.version, "communities", communityId, "bars"]);
        var request = JSURLRequest.initWithURL(url);
        request.addBearerAuthorization(this.authToken);
        return this.sendRequest(request, completion, target);
    }

});