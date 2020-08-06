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

JSClass("DetailViewButtonStyler", UIButtonStyler, {

    showsOverState: true,
    color: null,
    cornerRadius: 2,
    overBackgroundColor: null,
    activeBackgroundColor: null,
    disabledColor: null,
    activeColor: null,

    initWithColor: function(color){
        DetailViewButtonStyler.$super.init.call(this);
        this.color = color;
        this._commonInit();
    },

    init: function(){
        DetailViewButtonStyler.$super.init.call(this);
        this.initWithColor(JSColor.black);
    },

    initWithSpec: function(spec){
        DetailViewButtonStyler.$super.initWithSpec.call(this, spec);
        if (spec.containsKey('color')){
            this.color = spec.valueForKey("color", JSColor);
        }
        this._commonInit();
    },

    _commonInit: function(){
        this.titleInsets = JSInsets(1, 3);
        this.overBackgroundColor = this.color.colorWithAlpha(0.1);
        this.activeBackgroundColor = this.color.colorWithAlpha(0.2);
        this.disabledColor = this.color.colorWithAlpha(0.5);
        this.activeColor = this.color.colorDarkenedByPercentage(0.2);
    },

    initializeControl: function(button){
        DetailViewButtonStyler.$super.initializeControl.call(this, button);
        button.cornerRadius = this.cornerRadius;
        this.updateControl(button);
    },

    updateControl: function(button){
        DetailViewButtonStyler.$super.updateControl.call(this, button);
        if (button._imageView !== null){
            button._imageView.automaticRenderMode = JSImage.RenderMode.template;
        }
        if (!button.enabled){
            button.layer.backgroundColor = null;
            if (button._titleLabel !== null){
                button._titleLabel.textColor = this.disabledColor;
            }
            if (button._imageView !== null){
                button._imageView.templateColor = this.disabledColor;
            }
        }else if (button.active){
            button.layer.backgroundColor = this.activeBackgroundColor;
            if (button._titleLabel !== null){
                button._titleLabel.textColor = this.activeColor;
            }
            if (button._imageView !== null){
                button._imageView.templateColor = this.activeColor;
            }
        }else{
            if (button.over){
                button.layer.backgroundColor = this.overBackgroundColor;
            }else{
                button.layer.backgroundColor = null;
            }
            if (button._titleLabel !== null){
                button._titleLabel.textColor = this.color;
            }
            if (button._imageView !== null){
                button._imageView.templateColor = this.color;
            }
        }
    },

    intrinsicSizeOfControl: function(button){
        return this._intrinsicSizeOfControlGivenHeight(button, Number.MAX_VALUE);
    },

    _intrinsicSizeOfControlGivenHeight: function(button, height){
        var size = JSSize(button._titleInsets.width, button._titleInsets.height);
        var image = button.getImageForState(UIControl.State.normal);
        var titleSize = button._titleLabel !== null ? button._titleLabel.intrinsicSize : JSSize.Zero;
        var imageSize = image !== null ? image.size : JSSize.Zero;
        size.width += titleSize.width + imageSize.width;
        if (imageSize.width > 0 && titleSize.width > 0){
            size.width += this.titleImageSpacing;
        }
        if (height < Number.MAX_VALUE){
            size.height = height;
        }else{
            size.height += titleSize.height;
        }
        return size;
    },

    sizeControlToFitSize: function(button, size){
        var intrinsicSize = this._intrinsicSizeOfControlGivenHeight(button, size.height);
        var buttonSize = JSSize(Math.min(size.width, intrinsicSize.width), intrinsicSize.height);
        button.bounds = JSRect(JSPoint.Zero, buttonSize);
    },

    layoutControl: function(button){
        var image = button.getImageForState(UIControl.State.normal);
        var contentRect = button.bounds.rectWithInsets(button._titleInsets);
        var x = contentRect.origin.x;
        if (image !== null){
            button._imageView.frame = JSRect(x, contentRect.origin.y + (contentRect.size.height - image.size.height) / 2, image.size.width, image.size.height);
            x += image.size.width + this.titleImageSpacing;
        }
        if (button._titleLabel !== null){
            var w = Math.max(0, contentRect.origin.x + contentRect.size.width - x);
            var titleSize = button._titleLabel.intrinsicSize;
            button._titleLabel.frame = JSRect(x, contentRect.origin.y + (contentRect.size.height - titleSize.height) / 2, w, titleSize.height);
        }
        if (button._backgroundImageView !== null){
            button._backgroundImageView.frame = button.bounds;
        }
    },

});