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

// #import Foundation
'use strict';

(function(){

var logger = JSLog("morphic", "service");

JSProtocol("ServiceDelegate", JSProtocol, {

    serviceRequiresAuthentication: function(service, username, completion){}

});

JSClass("Service", JSObject, {

    initWithBaseURL: function(baseURL, urlSession){
        this.baseURL = baseURL;
        this.urlSession = urlSession || JSURLSession.shared;
    },

    defaults: null,
    notificationCenter: null,

    baseURL: null,

    authToken: null,
    user: null,
    username: null,
    version: "v1",

    signin: function(username, auth){
        this.authToken = auth.token;
        this.user = auth.user;
        this.username = username;
        this.notificationCenter.post(Service.Notification.userDidSignin, this);
    },

    signout: function(){
        this.authToken = null;
        this.user = null;
        this.notificationCenter.post(Service.Notification.userDidSignout, this);
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

    resendVerificationEmail: function(completion, target){
        var url = this.baseURL.appendingPathComponents([this.version, "users", this.user.id, "resend_verification"]);
        var request = JSURLRequest.initWithURL(url);
        request.method = JSURLRequest.Method.post;
        request.addBearerAuthorization(this.authToken);
        return this.sendRequest(request, completion, target);
    },

    waitingForAuthentication: false,
    unauthorizedRequestQueue: null,

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
                        if (this.delegate && this.delegate.serviceRequiresAuthentication){
                            if (this.unauthorizedRequestQueue === null){
                                this.unauthorizedRequestQueue = [];
                            }
                            this.unauthorizedRequestQueue.push({
                                request: request,
                                completion: completion,
                                target: target
                            });
                            if (!this.waitingForAuthentication){
                                this.waitingForAuthentication = true;
                                var service = this;
                                this.delegate.serviceRequiresAuthentication(this, this.username, function(success){
                                    service.waitingForAuthentication = false;
                                    if (success){
                                        service.retryUnauthorizedRequestQueue();
                                    }else{
                                        service.failUnauthorizedRequestQueue();
                                    }
                                });
                            }
                            return;
                        }
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
        }, this);
        task.resume();
        return task;
    },

    retryUnauthorizedRequestQueue: function(){
        var item;
        var queue = this.unauthorizedRequestQueue;
        this.unauthorizedRequestQueue = null;
        for (var i = 0, l = queue.length; i < l; ++i){
            item = queue[i];
            item.request.headerMap.set("Authorization", "Bearer " + this.authToken);
            this.sendRequest(item.request, item.completion, item.target);
        }
    },

    failUnauthorizedRequestQueue: function(){
        var item;
        var queue = this.unauthorizedRequestQueue;
        this.unauthorizedRequestQueue = null;
        for (var i = 0, l = queue.length; i < l; ++i){
            item = queue[i];
            item.completion.call(item.target, Service.Result.needsAuthentiation, null, null);
        }
    },


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