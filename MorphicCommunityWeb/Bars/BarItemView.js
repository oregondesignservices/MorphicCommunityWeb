// #import UIKit
'use strict';

JSClass("BarItemView", UIView, {

    initWithItem: function(item){
        var view = null;
        switch (item.kind){
            default:
                view = BarItemButtonView.init();
                break;
        }
        view.item = item;
        return view;
    },

    item: JSDynamicProperty('_item', null),
    editor: null,
    index: 0,
    dragging: false,

    setItem: function(item){
        this._item = item;
        this.update();
    },

    update: function(){
    },

    mouseDown: function(){
        this.editor.selectedItemIndex = this.index;
    },

    mouseDragged: function(){
        this.editor.selectedItemIndex = -1;
        this.dragging = true;
    },

    mouseUp: function(event){
        if (this.dragging){
            this.dragging = false;
            return;
        }
        this.editor.showDetailsForItemAtIndex(this.index);
    }

});

JSClass("BarItemButtonView", BarItemView, {

    imageView: null,
    imageBorderView: null,
    titleLabel: null,

    init: function(){
        BarItemButtonView.$super.init.call(this);
        this.titleLabel = UILabel.init();
        this.titleLabel.maximumNumberOfLines = 2;
        this.titleLabel.font = JSFont.systemFontOfSize(14);
        this.titleLabel.textInsets = JSInsets(10);
        this.titleLabel.backgroundColor = JSColor.initWithRGBA(0, 41/255.0, 87/255.0);
        this.titleLabel.textAlignment = JSTextAlignment.center;
        this.titleLabel.textColor = JSColor.white;
        this.imageBorderView = UIView.init();
        this.imageBorderView.backgroundColor = this.titleLabel.backgroundColor;
        this.imageView = UIImageView.init();
        this.imageView.backgroundColor = JSColor.white;
        this.imageView.borderColor = JSColor.white;
        this.imageView.borderWidth = 2;
        this.imageView.templateColor = this.titleLabel.backgroundColor;
        this.imageView.scaleMode = UIImageView.ScaleMode.aspectFill;
        this.addSubview(this.titleLabel);
        this.addSubview(this.imageBorderView);
        this.addSubview(this.imageView);
    },

    update: function(){
        this.titleLabel.text = this._item.label;
        if (this._item.imageURL){
            if (this._item.imageURL.isAbolute){
                this.imageView.image = JSImage.initWithURL(this._item.imageURL);
            }else{
                this.imageView.image = JSImage.initWithResourceName(this._item.imageURL.path).imageWithRenderMode(JSImage.RenderMode.template);
            }
            this.imageView.hidden = false;
            this.imageBorderView.hidden = false;
        }else{
            this.imageView.hidden = true;
            this.imageBorderView.hidden = true;
        }
    },

    sizeToFitSize: function(maxSize){
        var iconDiameter = this.imageView.hidden ? 0 : Math.floor(maxSize.width * 2 / 3);
        var iconOverlap = Math.floor(iconDiameter / 3);
        var textInsets = JSInsets(this.titleLabel.textInsets);
        textInsets.top = textInsets.bottom + iconOverlap;
        this.titleLabel.textInsets = textInsets;
        this.titleLabel.sizeToFitSize(maxSize);
        this.bounds = JSRect(0, 0, maxSize.width, iconDiameter - iconOverlap + this.titleLabel.bounds.size.height);
        this.setNeedsLayout();
    },

    layoutSubviews: function(){
        var iconDiameter = this.imageView.hidden ? 0 : Math.floor(this.bounds.size.width * 2 / 3);
        var iconOverlap = Math.floor(iconDiameter / 3);
        this.imageBorderView.frame = JSRect((this.bounds.size.width - iconDiameter) / 2, 0, iconDiameter, iconDiameter);
        this.imageBorderView.cornerRadius = this.imageBorderView.bounds.size.height / 2;
        this.imageView.frame = this.imageBorderView.frame.rectWithInsets(2);
        this.imageView.cornerRadius = this.imageView.bounds.size.height / 2;
        this.imageView.contentInsets = JSInsets(this.imageView.bounds.size.height * 0.2);
        var y = iconDiameter - iconOverlap;
        this.titleLabel.frame = JSRect(0, y, this.bounds.size.width, this.bounds.size.height - y);
    }

});