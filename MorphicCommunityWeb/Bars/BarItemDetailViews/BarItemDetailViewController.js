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

// #import UIKit
// #import "Bar.js"
/* global BarItemLinkDetailViewController, BarItemSkypeDetailViewController, BarItemApplicationDetailViewController, BarItemActionDetailViewController */
'use strict';

(function(){

JSProtocol("BarItemDetailViewControllerDelegate", JSProtocol, {

    barItemDetailViewDidAffectBarLayout: function(viewController){},
    barItemDetailViewDidFinishEditing: function(viewController, withChanges){},
    barItemDetailViewDidRemoveItem: function(viewController){}

});

JSClass("BarItemDetailViewController", UIViewController, {

    initForItem: function(item){
        if (item !== null){
            if (item.kind == BarItem.Kind.link){
                if (item.configuration.subkind == "skype"){
                    return BarItemSkypeDetailViewController.initWithSpecName("BarItemSkypeDetailViewController");    
                }
                return BarItemLinkDetailViewController.initWithSpecName("BarItemLinkDetailViewController");
            }
            if (item.kind == BarItem.Kind.application){
                return BarItemApplicationDetailViewController.initWithSpecName("BarItemApplicationDetailViewController");
            }
            if (item.kind == BarItem.Kind.action){
                return BarItemActionDetailViewController.initWithSpecName("BarItemActionDetailViewController");
            }
        }
        return BarItemDetailViewController.init();
    },

    item: null,

    delegate: null,

    changed: false,

    removeButton: JSOutlet(),

    fieldSpacing: 7,

    // MARK: - View Lifecycle

    viewDidLoad: function(){
        BarItemDetailViewController.$super.viewDidLoad.call(this);
    },

    viewWillAppear: function(animated){
        BarItemDetailViewController.$super.viewWillAppear.call(this, animated);
    },

    viewDidAppear: function(animated){
        BarItemDetailViewController.$super.viewDidAppear.call(this, animated);
    },

    viewWillDisappear: function(animated){
        BarItemDetailViewController.$super.viewWillDisappear.call(this, animated);
    },

    viewDidDisappear: function(animated){
        BarItemDetailViewController.$super.viewDidDisappear.call(this, animated);
        if (this.delegate && this.delegate.barItemDetailViewDidFinishEditing){
            this.delegate.barItemDetailViewDidFinishEditing(this, this.changed);
        }
    },

    contentSizeThatFitsSize: function(maxSize){
        var size = this.removeButton.intrinsicSize;
        if (size.width > maxSize.width){
            size.width = maxSize.width;
        }
        return size;
    },

    popupWindow: null,

    popupAdjacentToView: function(view, placement){
        this.popupWindow = BarItemDetailPopupWindow.init();
        this.popupWindow.contentInsets = JSInsets(10, 20, 20, 20);
        this.popupWindow.contentViewController = this;
        view.window.modal = this.popupWindow;
        this.popupWindow.openAdjacentToView(view, placement);
    },

    dismiss: function(){
        if (this.popupWindow !== null){
            this.popupWindow.close();
            this.popupWindow = null;
        }
    },

    removeItem: function(){
        if (this.delegate && this.delegate.barItemDetailViewDidRemoveItem){
            this.delegate.barItemDetailViewDidRemoveItem(this);
        }
    },

    textFieldDidReceiveEnter: function(textField){
        this.dismiss();
    },

    textFieldDidChange: function(textField){
        this.changed = true;
        if (textField === this.view.labelField){
            if (this.delegate && this.delegate.barItemDetailViewDidAffectBarLayout){
                this.delegate.barItemDetailViewDidAffectBarLayout(this);
            }
        }
    },

    colorCdhanged: function(){
        this.changed = true;
    },

    imageChanged: function(){
        this.changed = true;
        if (this.delegate && this.delegate.barItemDetailViewDidAffectBarLayout){
            this.delegate.barItemDetailViewDidAffectBarLayout(this);
        }
    },

});

JSClass("BarItemDetailPopupWindow", UIPopupWindow, {

    escapeClosesWindow: true,

    indicateModalStatus: function(){
        this.contentViewController.dismiss();
    },

    keyDown: function(event){
        if (this.escapeClosesWindow && event.key == UIEvent.Key.escape){
            this.contentViewController.dismiss();
        }else{
            BarItemDetailPopupWindow.$super.keyDown.call(this, event);
        }
    },

});

BarItemDetailViewController.URLToStringValueTransformer = {
    transformValue: function(url){
        if (url === null){
            return null;
        }
        return url.encodedString;
    },

    reverseTransformValue: function(string){
        return JSURL.initWithString(string);
    }
};

})();