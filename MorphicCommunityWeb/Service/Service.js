// #import Foundation
'use strict';

(function(){

var logger = JSLog("morphic", "service");

JSClass("Service", JSObject, {

    initWithBaseURL: function(baseURL, urlSession){
        this.baseURL = baseURL;
        this.urlSession = urlSession || JSURLSession.shared;
    },

    baseURL: null,

    authToken: null,
    user: null,
    version: "v1",

    signin: function(auth){
        this.authToken = auth.token;
        this.user = auth.user;
        JSNotificationCenter.shared.post(Service.Notification.userDidSignin, this);
    },

    signout: function(){
        this.authToken = null;
        this.user = null;
        JSNotificationCenter.shared.post(Service.Notification.userDidSignout, this);
    },

    loadUser: function(userId, completion, target){
        var url = this.baseURL.appendingPathComponents([this.version, "users", userId]);
        var request = JSURLRequest.initWithURL(url);
        request.addBearerAuthorization(this.authToken);
        return this.sendRequest(request, completion, target);
    },

    authenticateWithUsername: function(username, password, completion, target){
        var url = this.baseURL.appendingPathComponents([this.version, "auth", "username"]);
        var request = JSURLRequest.initWithURL(url);
        request.method = JSURLRequest.Method.post;
        request.object = {
            username: username,
            password: password
        };
        return this.sendRequest(request, completion, target);
    },

    registerWithUsername: function(email, password, firstName, lastName, completion, target){
        var url = this.baseURL.appendingPathComponents([this.version, "register", "username"]);
        var request = JSURLRequest.initWithURL(url);
        request.method = JSURLRequest.Method.post;
        request.object = {
            username: email,
            password: password,
            email: email,
            first_name: firstName,
            last_name: lastName
        };
        return this.sendRequest(request, completion, target);
    },

    sendRequest: function(request, completion, target){
        var task = this.urlSession.dataTaskWithRequest(request, function(error){
            if (error !== null){
                logger.error(error);
            }
            var result = Service.Result.noResponse;
            var object = null;
            var badRequest = null;
            if (task.response !== null){
                if (task.response.statusClass != JSURLResponse.StatusClass.success){
                    if (task.response.statusCode === JSURLResponse.StatusCode.unauthorized){
                        result = Service.Result.needsAuthentiation;
                    }else if (task.response.statusCode === JSURLResponse.StatusCode.internalServerError){
                        result = Service.Result.serverError;
                    }else if (task.response.statusCode === JSURLResponse.StatusCode.badRequest){
                        result = Service.Result.badRequest;
                        badRequest = task.response.object;
                    }else{
                        result = Service.Result.otherError;
                    }
                }else{
                    result = Service.Result.success;
                    object = task.response.object;
                }
            }
            completion.call(target, result, object, badRequest);
        });
        task.resume();
        return task;
    }


});

Service.Result = {
    success: 0,
    noResponse: 1,
    badRequest: 2,
    needsAuthentiation: 3,
    serverError: 4,
    otherError: 5
};

Service.Notification = {
    userDidSignin: "org.raisingthefloor.MorphicCommunityWeb.ServiceUserDidSignin",
    userDidSignout: "org.raisingthefloor.MorphicCommunityWeb.ServiceUserDidSignout"
};

})();