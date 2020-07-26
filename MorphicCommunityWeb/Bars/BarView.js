// #import UIKit
'use strict';

JSClass("BarView", UIView, {

    init: function(){
        BarView.$super.init.call(this);
        this.itemViews = [];
        this.itemInsets = JSInsets(15,10);
        this.overflowButton = UIButton.initWithStyler(BarOverflowButtonStyler.init());
        this.overflowButton.setImageForState(JSImage.initWithResourceName("BarOverflowArrow"), UIControl.State.normal);
        this.overflowButton.tilteInsets = JSInsets(6);
        this.addSubview(this.overflowButton);
        this.itemViewsContainer = UIView.init();
        this.addSubview(this.itemViewsContainer);

    },

    editor: null,
    itemViewsContainer: null,
    itemViews: null,
    itemInsets: null,
    itemSpacing: 10,
    overflowButton: null,

    targetItemViewIndex: JSDynamicProperty('_targetItemViewIndex', -1),
    targetItemHeight: 100,

    setTargetItemViewIndex: function(targetItemViewIndex){
        this._targetItemViewIndex = targetItemViewIndex;
        this.setNeedsLayout();
    },

    targetItemViewIndexForLocation: function(location){
        var itemView;
        var index, l;
        for (index = 0, l = this.itemViews.length; index < l; ++index){
            itemView = this.itemViews[index];
            if (location.y < itemView.frame.origin.y + itemView.frame.size.height){
                break;
            }
            if (itemView.hidden){
                break;
            }
        }
        return index;
    },

    insertItemViewAtIndex: function(itemView, index){
        itemView.editor = this.editor;
        itemView.index = index;
        this.itemViews.splice(index, 0, itemView);
        this.itemViewsContainer.insertSubviewAtIndex(itemView, index);
        var width = this.bounds.size.width - this.itemInsets.width;
        itemView.sizeToFitSize(JSSize(width, Number.MAX_VALUE));
        if (index === 0){
            itemView.frame = JSRect(this.itemInsets.left, this.itemInsets.top, width, itemView.bounds.size.height);
        }else{
            itemView.frame = JSRect(this.itemInsets.left, this.itemViews[index - 1].frame.origin.y + this.itemViews[index - 1].frame.size.height + this.itemSpacing, width, itemView.bounds.size.height);
        }
        for (var i = index + 1, l = this.itemViews.length; i < l; ++i){
            this.itemViews[i].index += 1;
        }
        this.setNeedsLayout();
    },

    removeItemViewAtIndex: function(index){
        var itemView = this.itemViews[index];
        itemView.editor = null;
        itemView.removeFromSuperview();
        this.itemViews.splice(index, 1);
        for (var i = index, l = this.itemViews.length; i < l; ++i){
            this.itemViews[i].index -= 1;
        }
        this.setNeedsLayout();
    },

    layoutSubviews: function(){
        this.itemViewsContainer.frame = this.bounds;
        var origin = JSPoint(this.itemInsets.left, this.itemInsets.top);
        var maxItemSize = JSSize(this.bounds.size.width - this.itemInsets.width, Number.MAX_VALUE);
        var itemView;
        for (var i = 0, l = this.itemViews.length; i < l; ++i){
            itemView = this.itemViews[i];
            itemView.sizeToFitSize(maxItemSize);
            if (i === this.targetItemViewIndex){
                origin.y += this.targetItemHeight;
            }
            if (origin.y + itemView.bounds.size.height + this.itemInsets.bottom > this.bounds.size.height){
                break;
            }
            itemView.frame = JSRect(origin, itemView.bounds.size);
            origin.y += itemView.bounds.size.height + this.itemSpacing;
        }
        this.overflowButton.hidden = i == l;
        for (; i < l; ++i){
            itemView = this.itemViews[i];
            itemView.hidden = true;
        }
        var buttonHeight = this.overflowButton.intrinsicSize.height;
        this.overflowButton.bounds = JSRect(0, 0, buttonHeight, buttonHeight);
        this.overflowButton.cornerRadius = buttonHeight / 2;
        this.overflowButton.position = JSPoint(0, this.bounds.size.height - 20);
    }

});

JSClass("BarOverflowButtonStyler", UIButtonStyler, {

    normalBackgroundColor: null,
    activeBackgroundColor: null,

    init: function(){
        this.normalBackgroundColor = JSColor.initWithRGBA(0, 41/255.0, 87/255.0);
        this.activeBackgroundColor = this.normalBackgroundColor.colorDarkenedByPercentage(0.2);
    },

    updateControl: function(button){
        BarOverflowButtonStyler.$super.updateControl.call(this, button);
        button._imageView.templateColor = JSColor.white;
        if (button.active){
            button.backgroundColor = this.activeBackgroundColor;
        }else{
            button.backgroundColor = this.normalBackgroundColor;
        }
    },

    intrinsicSizeOfControl: function(button){
        return JSSize(25, 25);
    },

    layoutControl: function(button){
        button._imageView.bounds = JSRect(0, 0, button._imageView.image.size.width, button._imageView.image.size.height);
        button._imageView.position = button.bounds.center.adding(JSPoint(-1, 0));
    }

});