// #import UIKit
// #import "DetailViewButtonStyler.js"
'use strict';

JSClass("BarItemDetailView", UIView, {

    initWithFrame: function(frame){
        BarItemDetailView.$super.initWithFrame.call(this, frame);
        this.contentInsets = JSInsets(10);
        this.removeButton = UIButton.initWithStyler(DetailViewButtonStyler.initWithColor(JSColor.initWithRGBA(129/255.0, 43/255.0, 0)));
        this.removeButton.titleLabel.text = JSBundle.mainBundle.localizedString("remove.title", "BarItemDetailViews");
        this.removeButton.setImageForState(JSImage.initWithResourceName("RemoveIcon"), UIControl.State.normal);       
        this.addSubview(this.removeButton);
    },

    contentInsets: null,
    initialFirstResponder: null,

    getIntrinsicSize: function(){
        var size = JSSize(this.contentInsets.size.width, this.contentInsets.height);
        var buttonSize = this.removeButton.intrinsicSize;
        size.width += buttonSize.width;
        size.height += buttonSize.height;
        return size;
    },

    layoutSubviews: function(){
        BarItemDetailView.$super.layoutSubviews.call(this);
        var bounds = this.bounds.rectWithInsets(this.contentInsets);
        this.removeButton.frame = bounds;
    }

});