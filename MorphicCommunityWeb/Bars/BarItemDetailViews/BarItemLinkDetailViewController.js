// #import UIKit
// #import "BarItemButtonDetailViewController.js"
'use strict';

(function(){

JSClass("BarItemLinkDetailViewController", BarItemButtonDetailViewController, {

    urlField: JSOutlet(),

    viewDidLoad: function(){
        BarItemLinkDetailViewController.$super.viewDidLoad.call(this);
    },

    viewWillAppear: function(animated){
        BarItemLinkDetailViewController.$super.viewWillAppear.call(this, animated);
    },

    viewDidAppear: function(animated){
        BarItemLinkDetailViewController.$super.viewDidAppear.call(this, animated);
        this.view.window.firstResponder = this.labelField;
    },

    viewWillDisappear: function(animated){
        BarItemLinkDetailViewController.$super.viewWillDisappear.call(this, animated);
    },

    viewDidDisappear: function(animated){
        BarItemLinkDetailViewController.$super.viewDidDisappear.call(this, animated);
    },

    contentSizeThatFitsSize: function(maxSize){
        var size = JSSize(this.colorBar.shortcutSize * 8 + this.colorBar.shortcutSpacing * 7, 0);
        size.height += this.removeButton.intrinsicSize.height;
        size.height += this.fieldSpacing;
        size.height += this.labelField.intrinsicSize.height;
        size.height += this.fieldSpacing;
        size.height += this.urlField.intrinsicSize.height;
        size.height += this.fieldSpacing;
        size.height += this.colorBar.intrinsicSize.height;
        var imagePickerSize = this.imagePicker.sizeThatFitsSize(JSSize(size.width, Number.MAX_VALUE));
        size.height += this.fieldSpacing;
        size.height += imagePickerSize.height;
        return size;
    },

    viewDidLayoutSubviews: function(){
        var bounds = this.view.bounds;
        var height = this.labelField.intrinsicSize.height;
        var x = 0;
        var y = 0;
        var buttonSize = this.removeButton.intrinsicSize;
        this.removeButton.frame = JSRect(bounds.origin.x + bounds.size.width - buttonSize.width, y, buttonSize.width, buttonSize.height);
        y += buttonSize.height + this.fieldSpacing;
        this.labelField.frame = JSRect(bounds.origin.x + x, bounds.origin.y + y, bounds.size.width, height);
        y += height + this.fieldSpacing;
        height = this.urlField.intrinsicSize.height;
        this.urlField.frame = JSRect(bounds.origin.x + x, bounds.origin.y + y, bounds.size.width, height);
        y += height + this.fieldSpacing;
        height = this.colorBar.intrinsicSize.height;
        this.colorBar.frame = JSRect(bounds.origin.x + x, bounds.origin.y + y, bounds.size.width, height);
        y += height + this.fieldSpacing;
        var imagePickerSize = this.imagePicker.sizeThatFitsSize(JSSize(bounds.size.width, Number.MAX_VALUE));
        this.imagePicker.frame = JSRect(bounds.origin.x + x, bounds.origin.y + y, bounds.size.width, imagePickerSize.height);
    }

});

})();