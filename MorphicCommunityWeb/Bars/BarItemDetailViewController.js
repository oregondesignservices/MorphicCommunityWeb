// #import UIKit
'use strict';

JSProtocol("BarItemDetailViewController", JSProtocol, {

    barItemDetailViewDidFinishEditing: function(viewController){} 

});

JSClass("BarItemDetailViewController", UIViewController, {

    item: null,

    delegate: null,

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
            this.delegate.barItemDetailViewDidFinishEditing(this);
        }
    },

    contentSizeThatFitsSize: function(maxSize){
        var size = JSSize.Zero;
        if (maxSize.width < Number.MAX_VALUE){
            size.width = maxSize.width;
        }else{
            size.width = 300;
        }
        size.height = 300;
        return size;
    },

    popupWindow: null,

    popupAdjacentToView: function(view, placement){
        this.popupWindow = BarItemDetailPopupWindow.init();
        this.popupWindow.contentViewController = this;
        view.window.modal = this.popupWindow;
        this.popupWindow.openAdjacentToView(view, placement);
    },

    dismiss: function(){
        if (this.popupWindow !== null){
            this.popupWindow.close();
            this.popupWindow = null;
        }
    }

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