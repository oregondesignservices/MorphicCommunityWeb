// #import UIKit
// #import "SigninScene.js"
// #import "RegisterScene.js"
// #import "MainScene.js"
// #import "Service+Extensions.js"
// #import "Theme.js"
'use strict';

(function(){

var logger = JSLog("morphic", "appdelegate");

JSClass("ApplicationDelegate", JSObject, {

    baseURL: null,

    // MARK: - Application Lifecyle

    applicationDidFinishLaunching: function(application, launchOptions){
        this.baseURL = application.baseURL;
        this.registerDefaults();
        this.service = Service.initWithBaseURL(JSURL.initWithString(application.getenv('MORPHIC_SERVER_URL')));
        this.service.notificationCenter = JSNotificationCenter.shared;
        this.service.defaults = this.defaults;
        this.service.notificationCenter.addObserver(Service.Notification.userDidSignin, this.service, this.userDidSignin, this);
        this.service.notificationCenter.addObserver(Service.Notification.userDidSignout, this.service, this.userDidSignout, this);
        application.shortcutMenu = this.createShortcutMenu();
        this.recallUser();
        this.showLoading(launchOptions);
    },

    // MARK: - Shortcut menu

    createShortcutMenu: function(){
        var menu = UIMenu.init();
        var item = UIMenuItem.initWithTitle("Undo", "undo");
        item.keyEquivalent = "z";
        menu.addItem(item);
        item = UIMenuItem.initWithTitle("Redo", "redo");
        if (UIPlatform.shared.identifier == UIPlatform.Identifier.mac){
            item.keyEquivalent = "z";
            item.keyModifiers = UIEvent.Modifier.shift;
        }else{
            item.keyEquivalent = "y";
        }
        menu.addItem(item);
        return menu;
    },

    // MARK: - Service

    service: null,

    userDidSignin: function(){
        this.rememberUser();
    },

    userDidSignout: function(){
        this.forgetUser();
    },

    recallUser: function(){
        this.service.authToken = this.getSessionValue("authToken");
        var userJSON = this.getSessionValue("user");
        if (userJSON !== null){
            this.service.user = JSON.parse(userJSON);
        }
    },

    rememberUser: function(){
        this.setSessionValue("authToken", this.service.authToken);
        this.setSessionValue("user", JSON.stringify(this.service.user));
    },

    forgetUser: function(){
        this.deleteSessionValue("authToken");
        this.deleteSessionValue("user");
    },

    // MARK: - Scene Selection

    showRegister: function(){
        var registerScene = RegisterScene.initWithSpecName("RegisterScene");
        registerScene.delegate = this;
        registerScene.service = this.service;
        registerScene.show();
    },

    registerSceneDidComplete: function(registerScene, community){
        window.history.replaceState(null, null, this.baseURL.encodedString);
        this.defaults.setValueForKey(community.id, "selectedCommunityId");
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

    showLoading: function(launchOptions){
        // If we have sessions credentials, we need to check if they're still
        // valid.  So while we're checking, show a scene that mimics the
        // bootstrap splash screen.
        var loadingScene = UIScene.initWithSpecName("LoadingScene");
        loadingScene.show();
        var showNextScene = function(needsSignin){
            loadingScene.close();
            if (needsSignin){
                this.service.signout();
            }
            if (launchOptions.uistate === "/register"){
                this.showRegister();
            }else if (needsSignin){
                this.showSignin();
            }else{
                this.showMain();
            }
        };
        var activeUser = this.service.user;
        if (activeUser === null){
            showNextScene.call(this, true);
        }else{
            this.service.loadUser(activeUser.id, function(result){
                showNextScene.call(this, result !== Service.Result.success);
            }, this);
        }
    },

    showMain: function(){
        var mainScene = MainScene.initWithSpecName("MainScene");
        mainScene.service = this.service;
        mainScene.show();
    },

    // MARK: - UserDefaults

    defaults: null,

    registerDefaults: function(){
        this.defaults = JSUserDefaults.shared;
        this.defaults.registerDefaults({
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
    },

    deleteSessionValue: function(name){
        if (!window.sessionStorage){
            return;
        }
        try{
            return window.sessionStorage.removeItem(name);
        }catch (e){
            logger.info("Cannot delete from sessionStorage: %{error}", e);
        }
    }

});

})();