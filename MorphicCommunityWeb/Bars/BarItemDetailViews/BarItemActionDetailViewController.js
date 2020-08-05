// #import UIKit
// #import "BarItemDetailViewController.js"
'use strict';

(function(){

JSClass("BarItemActionDetailViewController", BarItemDetailViewController, {

    colorBar: JSOutlet(),

    viewDidLoad: function(){
        BarItemActionDetailViewController.$super.viewDidLoad.call(this);
    },

    viewWillAppear: function(animated){
        BarItemActionDetailViewController.$super.viewWillAppear.call(this, animated);
    },

    viewDidAppear: function(animated){
        BarItemActionDetailViewController.$super.viewDidAppear.call(this, animated);
    },

    viewWillDisappear: function(animated){
        BarItemActionDetailViewController.$super.viewWillDisappear.call(this, animated);
    },

    viewDidDisappear: function(animated){
        BarItemActionDetailViewController.$super.viewDidDisappear.call(this, animated);
    },

    contentSizeThatFitsSize: function(maxSize){
        var size = JSSize(this.colorBar.shortcutSize * 8 + this.colorBar.shortcutSpacing * 7, 0);
        size.height += this.removeButton.intrinsicSize.height;
        size.height += this.colorBar.intrinsicSize.height;
        return size;
    },

    viewDidLayoutSubviews: function(){
        var bounds = this.view.bounds;
        var x = 0;
        var y = 0;
        var buttonSize = this.removeButton.intrinsicSize;
        this.removeButton.frame = JSRect(bounds.origin.x + bounds.size.width - buttonSize.width, y, buttonSize.width, buttonSize.height);
        y += buttonSize.height;
        var height = this.colorBar.intrinsicSize.height;
        this.colorBar.frame = JSRect(bounds.origin.x + x, bounds.origin.y + y, bounds.size.width, height);
    },

    colorChanged: function(){
        this.changed = true;
    }

});

})();