// #import UIKit
// #import "DetailViewButtonStyler.js"
'use strict';

JSClass("BarItemDetailView", UIView, {

    initWithFrame: function(frame){
        BarItemDetailView.$super.initWithFrame.call(this, frame);
        this.removeButton = UIButton.initWithStyler(DetailViewButtonStyler.initWithColor(JSColor.initWithRGBA(129/255.0, 43/255.0, 0)));
        this.removeButton.titleLabel.text = JSBundle.mainBundle.localizedString("remove.title", "BarItemDetailViews");
        this.removeButton.setImageForState(JSImage.initWithResourceName("RemoveIcon"), UIControl.State.normal);
        this.addSubview(this.removeButton);
    },

    initialFirstResponder: null,

    getIntrinsicSize: function(){
        return JSSize(UIView.noIntrinsicSize, 20);
    }

});