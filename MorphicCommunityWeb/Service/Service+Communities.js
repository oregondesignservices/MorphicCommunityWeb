// #import "Service.js"
'use strict';

Service.definePropertiesFromExtensions({

    createCommunity: function(community, completion, target){
        var url = this.baseURL.appendingPathComponents(["v1", "communities"]);
        var request = JSURLRequest.initWithURL(url);
        request.method = JSURLRequest.Method.post;
        request.object = {
            name: community.name
        };
        request.addBearerAuthorization(this.authToken);
        return this.sendRequest(request, completion, target);
    },

    loadCommunities: function(completion, target){
        var url = this.baseURL.appendingPathComponents(["v1", "users", this.user.id, "communities"]);
        var request = JSURLRequest.initWithURL(url);
        request.addBearerAuthorization(this.authToken);
        return this.sendRequest(request, completion, target);
    },

});