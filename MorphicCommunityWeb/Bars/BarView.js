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
'use strict';

JSClass("BarView", UIView, {

    init: function(){
        BarView.$super.init.call(this);
        this.itemViews = [];
        this.itemInsets = JSInsets(15,10);
        this.overflowBackgroundView = UIView.init();
        this.overflowBackgroundView.backgroundColor = JSColor.white;
        this.addSubview(this.overflowBackgroundView);
        this.barBackgroundView = UIView.init();
        this.barBackgroundView.backgroundColor = JSColor.white;
        this.barBackgroundView.shadowOffset = JSPoint.Zero;
        this.barBackgroundView.shadowColor = JSColor.black.colorWithAlpha(0.4);
        this.barBackgroundView.shadowRadius = 4;
        this.addSubview(this.barBackgroundView);
        this.overflowButton = UIButton.initWithStyler(BarOverflowButtonStyler.init());
        this.overflowButton.setImageForState(JSImage.initWithResourceName("BarOverflowArrow"), UIControl.State.normal);
        this.overflowButton.tilteInsets = JSInsets(6);
        this.addSubview(this.overflowButton);
        this.itemViewsContainer = UIView.init();
        this.addSubview(this.itemViewsContainer);

        // The selection indicator sits behind bar items and shows which one,
        // if any, is selected
        this.selectionIndicator = UIView.init();
        this.selectionIndicator.backgroundColor = JSColor.initWithRGBA(0, 41/255.0, 87/255.0, 0.3);
        this.selectionIndicator.cornerRadius = 2;
        this.selectionIndicator.hidden = true;
        this.insertSubviewAboveSibling(this.selectionIndicator, this.barBackgroundView);

        this._itemIndexByColumn = [];
    },

    editor: null,
    itemViewsContainer: null,
    itemViews: null,
    itemInsets: null,
    itemSpacing: 10,
    overflowButton: null,

    selectionIndicator: null,
    selectedItemIndex: JSDynamicProperty('_selectedItemIndex', -1),

    setSelectedItemIndex: function(selectedItemIndex){
        this._selectedItemIndex = selectedItemIndex;
        this.setNeedsLayout();
    },

    targetItemViewIndex: JSDynamicProperty('_targetItemViewIndex', -1),
    targetItemHeight: 100,
    targetItemOrigin: null,

    setTargetItemViewIndex: function(targetItemViewIndex){
        this._targetItemViewIndex = targetItemViewIndex;
        this.setNeedsLayout();
    },

    _itemIndexByColumn: null,

    targetItemViewIndexForLocation: function(location){
        var column = Math.max(0, Math.min(this._itemIndexByColumn.length - 1, Math.floor((this.bounds.size.width - location.x) / this.bounds.size.width)));
        var i0 = this._itemIndexByColumn[column];
        var i1 = column < this._itemIndexByColumn.length - 1 ? this._itemIndexByColumn[column + 1] : this.itemViews.length;
        var itemView;
        var index;
        for (index = i0; index < i1; ++index){
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
        if (this.targetItemViewIndex >= 0 && index < this.targetItemViewIndex){
            this.targetItemViewIndex -= 1;
        }
        this.setNeedsLayout();
    },

    layoutSubviews: function(){
        this.barBackgroundView.frame = this.bounds;
        this.itemViewsContainer.frame = this.bounds;
        var origin = JSPoint(this.itemInsets.left, this.itemInsets.top);
        var maxItemSize = JSSize(this.bounds.size.width - this.itemInsets.width, Number.MAX_VALUE);
        var itemView;
        this.selectionIndicator.hidden = true;
        this.overflowBackgroundView.hidden = true;
        this.overflowButton.hidden = true;
        this._itemIndexByColumn = [0];
        for (var i = 0, l = this.itemViews.length; i < l; ++i){
            itemView = this.itemViews[i];
            if (!itemView.dragging){
                itemView.sizeToFitSize(maxItemSize);
            }
            if (i === this.targetItemViewIndex){
                if (origin.y + this.targetItemHeight + this.itemInsets.bottom > this.bounds.size.height){
                    origin.x -= this.bounds.size.width;
                    origin.y = this.itemInsets.top ;
                    this.overflowBackgroundView.hidden = false;
                    this.overflowButton.hidden = false;
                    this._itemIndexByColumn.push(i);
                }
                this.targetItemOrigin = JSPoint(origin);
                origin.y += this.targetItemHeight + this.itemSpacing;
            }
            if (origin.y + itemView.bounds.size.height + this.itemInsets.bottom > this.bounds.size.height){
                origin.x -= this.bounds.size.width;
                origin.y = this.itemInsets.top;
                this.overflowBackgroundView.hidden = false;
                this.overflowButton.hidden = false;
                this._itemIndexByColumn.push(i);
            }
            if (!itemView.dragging){
                itemView.frame = JSRect(origin, itemView.bounds.size);
                origin.y += itemView.bounds.size.height + this.itemSpacing;
            }
            if (i === this._selectedItemIndex){
                this.selectionIndicator.hidden = false;
                this.selectionIndicator.frame = itemView.convertRectToView(itemView.bounds, this.selectionIndicator.superview).rectWithInsets(-5);
            }
        }
        if (i === this.targetItemViewIndex){
            if (origin.y + this.targetItemHeight + this.itemInsets.bottom > this.bounds.size.height){
                origin.x -= this.bounds.size.width;
                origin.y = this.itemInsets.top ;
                this.overflowBackgroundView.hidden = false;
                this.overflowButton.hidden = false;
                this._itemIndexByColumn.push(i);
            }
            this.targetItemOrigin = JSPoint(origin);
            origin.y += this.targetItemHeight + this.itemSpacing;
        }
        var x = origin.x - this.itemInsets.left;
        this.overflowBackgroundView.frame = JSRect(x, 2, -x, this.bounds.size.height - 4);
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