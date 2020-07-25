// #import UIKit
'use strict';

JSClass("BarItemView", UIView, {

    iconView: null,
    iconBorderView: null,
    titleLabel: null,

    init: function(){
        BarItemView.$super.init.call(this);
        this.titleLabel = UILabel.init();
        this.titleLabel.maximumNumberOfLines = 1;
        this.titleLabel.font = JSFont.systemFontOfSize(14);
        this.titleLabel.textInsets = JSInsets(10);
        this.titleLabel.backgroundColor = JSColor.initWithRGBA(0, 41/255.0, 87/255.0);
        this.titleLabel.textAlignment = JSTextAlignment.center;
        this.titleLabel.textColor = JSColor.white;
        this.iconBorderView = UIView.init();
        this.iconBorderView.backgroundColor = this.titleLabel.backgroundColor;
        this.iconView = UIImageView.init();
        this.iconView.backgroundColor = JSColor.white;
        this.iconView.borderColor = JSColor.white;
        this.iconView.borderWidth = 2;
        this.addSubview(this.titleLabel);
        this.addSubview(this.iconBorderView);
        this.addSubview(this.iconView);
    },

    sizeToFitSize: function(maxSize){
        var iconDiameter = Math.floor(maxSize.width * 2 / 3);
        var iconOverlap = Math.floor(iconDiameter / 3);
        var textInsets = JSInsets(this.titleLabel.textInsets);
        textInsets.top = textInsets.bottom + iconOverlap;
        this.titleLabel.textInsets = textInsets;
        // this.titleLabel.sizeToFitSize(maxSize);
        this.bounds = JSRect(0, 0, maxSize.width, this.titleLabel.font.displayLineHeight * this.titleLabel.maximumNumberOfLines + iconDiameter - iconOverlap + this.titleLabel.textInsets.height);
    },

    layoutSubviews: function(){
        var iconDiameter = Math.floor(this.bounds.size.width * 2 / 3);
        var iconOverlap = Math.floor(iconDiameter / 3);
        this.iconBorderView.frame = JSRect((this.bounds.size.width - iconDiameter) / 2, 0, iconDiameter, iconDiameter);
        this.iconBorderView.cornerRadius = this.iconBorderView.bounds.size.height / 2;
        this.iconView.frame = this.iconBorderView.frame.rectWithInsets(2);
        this.iconView.cornerRadius = this.iconView.bounds.size.height / 2;
        var y = iconDiameter - iconOverlap;
        this.titleLabel.frame = JSRect(0, y, this.bounds.size.width, this.bounds.size.height - y);
    }

});