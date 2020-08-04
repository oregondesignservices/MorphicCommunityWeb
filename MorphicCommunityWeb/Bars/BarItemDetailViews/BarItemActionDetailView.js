// #import UIKit
// #import "BarItemDetailView.js"
// #import "Theme.js"
// #import "ColorBar.js"
'use strict';

JSClass("BarItemActionDetailView", BarItemDetailView, {

    initWithFrame: function(frame){
        BarItemActionDetailView.$super.initWithFrame.call(this, frame);

        this.colorBar = ColorBar.init();
        this.addSubview(this.colorBar);
    },

    colorBar: null,
    fieldSpacing: 7,

    getIntrinsicSize: function(){
        var size = JSSize(this.contentInsets.width + this.colorBar.shortcutSize * 8 + this.colorBar.shortcutSpacing * 7, this.contentInsets.height);
        size.height += this.removeButton.intrinsicSize.height;
        size.height += this.colorBar.intrinsicSize.height;
        return size;
    },

    layoutSubviews: function(){
        BarItemActionDetailView.$super.layoutSubviews.call(this);
        var bounds = this.bounds.rectWithInsets(this.contentInsets);
        var x = 0;
        var y = 0;
        var buttonSize = this.removeButton.intrinsicSize;
        this.removeButton.frame = JSRect(bounds.origin.x + bounds.size.width - buttonSize.width, y, buttonSize.width, buttonSize.height);
        y += buttonSize.height;
        var height = this.colorBar.intrinsicSize.height;
        this.colorBar.frame = JSRect(bounds.origin.x + x, bounds.origin.y + y, bounds.size.width, height);
    }

});