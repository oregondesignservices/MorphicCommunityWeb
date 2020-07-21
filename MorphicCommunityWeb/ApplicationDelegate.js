// #import UIKit
// #import "SigninScene.js"
// #import "RegisterScene.js"
// #import "MainScene.js"
// #import "Service+Extensions.js"
'use strict';

(function(){

var logger = JSLog("morphic", "appdelegate");

JSClass("ApplicationDelegate", JSObject, {

    // MARK: - Application Lifecyle

    applicationDidFinishLaunching: function(application, launchOptions){
        this.registerDefaults();
        this.service = Service.initWithBaseURL(JSURL.initWithString(application.getenv('MORPHIC_SERVER_URL')));
        JSNotificationCenter.shared.addObserver(Service.Notification.userDidSignin, this.userDidSignin, this);
        this.service.authToken = this.getSessionValue("authToken");
        if (launchOptions.uistate === "/register"){
            this.showRegister();
        }else if (this.service.authToken){
            this.showMain();
        }else{
            this.showSignin();
        }
    },

    // MARK: - Service

    service: null,

    userDidSignin: function(){
        this.setSessionValue("authToken", this.service.authToken);
    },

    // MARK: - Scene Selection

    showRegister: function(){
        var registerScene = RegisterScene.initWithSpecName("RegisterScene");
        registerScene.delegate = this;
        registerScene.service = this.service;
        registerScene.show();
    },

    registerSceneDidComplete: function(registerScene, community){
        JSUserDefaults.shared.setValueForKey(community.id, "selectedCommunityId");
        registerScene.close();
        this.showMain();
    },

    showSignin: function(){
        var signinScene = SigninScene.initWithSpecName("SigninScene");
        signinScene.delegate = this;
        signinScene.service = this.service;
        signinScene.show();
    },

    signinSceneDidComplete: function(signinScene, auth){
        this.service.signin(auth);
        signinScene.close();
        this.showMain();
    },

    showMain: function(){
        var mainScene = MainScene.initWithSpecName("MainScene");
        mainScene.service = this.service;
        mainScene.show();
    },

    // MARK: - UserDefaults

    registerDefaults: function(){
        JSUserDefaults.shared.registerDefaults({
            selectedCommunityId: null,
        });
    },

    // MARK: - Session storage

    setSessionValue: function(name, value){
        if (!window.sessionStorage){
            return;
        }
        try{
            window.sessionStorage.setItem(name, value);
        }catch (e){
            logger.info("Cannot write to sessionStorage: %{error}", e);
        }
    },

    getSessionValue: function(name){
        if (!window.sessionStorage){
            return;
        }
        try{
            return window.sessionStorage.getItem(name);
        }catch (e){
            logger.info("Cannot read from sessionStorage: %{error}", e);
        }
    }

});

})();