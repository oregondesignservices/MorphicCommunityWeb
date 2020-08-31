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

JSClass("CommunityBillingPlanView", UIControl, {

    index: 0,
    nameLabel: null,
    priceLabel: null,
    periodLabel: null,
    secondaryPriceLabel: null,
    secondaryPeriodLabel: null,
    color: JSColor.initWithWhite(0.8),
    selectedColor: JSColor.initWithRGBA(0, 129/255.0, 69/255.0),

    commonUIControlInit: function(){
        CommunityBillingPlanView.$super.commonUIControlInit.call(this);
        this.hasOverState = true;
        this.borderWidth = 1;
        this.nameLabel = UILabel.init();
        this.nameLabel.textInsets = JSInsets(4);
        this.nameLabel.font = this.nameLabel.font.fontWithWeight(JSFont.Weight.regular).fontWithPointSize(JSFont.Size.detail * 1.2);
        this.nameLabel.textAlignment = JSTextAlignment.center;
        this.priceLabel = UILabel.init();
        this.priceLabel.textInsets = JSInsets(4);
        this.priceLabel.font = this.priceLabel.font.fontWithWeight(JSFont.Weight.bold).fontWithPointSize(JSFont.Size.heading);
        this.priceLabel.textAlignment = JSTextAlignment.center;
        this.periodLabel = UILabel.init();
        this.periodLabel.textInsets = JSInsets(0, 4);
        this.periodLabel.textAlignment = JSTextAlignment.center;
        this.periodLabel.font = this.periodLabel.font.fontWithPointSize(JSFont.Size.detail);
        this.periodLabel.maximumNumberOfLines = 2;
        this.secondaryPriceLabel = UILabel.init();
        this.secondaryPriceLabel.textInsets = JSInsets(4, 4, 0, 4);
        this.secondaryPriceLabel.textAlignment = JSTextAlignment.center;
        this.secondaryPriceLabel.font = this.periodLabel.font.fontWithPointSize(JSFont.Size.detail);
        this.secondaryPriceLabel.textColor = JSColor.initWithWhite(0.4);
        this.secondaryPeriodLabel = UILabel.init();
        this.secondaryPeriodLabel.textInsets = JSInsets(0, 4, 4, 4);
        this.secondaryPeriodLabel.textAlignment = JSTextAlignment.center;
        this.secondaryPeriodLabel.font = this.secondaryPeriodLabel.font.fontWithPointSize(JSFont.Size.detail);
        this.secondaryPeriodLabel.textColor = this.secondaryPriceLabel.textColor;
        this.secondaryPeriodLabel.maximumNumberOfLines = 2;

        this.addSubview(this.nameLabel);
        this.addSubview(this.priceLabel);
        this.addSubview(this.periodLabel);
        this.addSubview(this.secondaryPriceLabel);
        this.addSubview(this.secondaryPeriodLabel);

        this.update();
    },

    selected: JSDynamicProperty('_selected', false),

    setSelected: function(selected){
        if (selected != this._selected){
            this._selected = selected;
            this.update();
        }
    },

    update: function(){
        this.transform = JSAffineTransform.Identity;
        this.alpha = 1;
        this.backgroundColor = JSColor.white;
        if (this.selected){
            this.borderColor = this.selectedColor;
            this.nameLabel.backgroundColor = this.selectedColor;
            this.nameLabel.textColor = JSColor.white;
        }else{
            this.borderColor = this.color;
            this.nameLabel.backgroundColor = this.color;
            this.nameLabel.textColor = JSColor.black;
        }
        if (!this.enabled){
            this.alpha = 0.3;
        }else{
            if (this.active){
                this.backgroundColor = JSColor.initWithWhite(0.9);
                this.transform = JSAffineTransform.Scaled(1.05, 1.05);
            }else if (this.over){
                this.transform = JSAffineTransform.Scaled(1.1, 1.1);
            }
        }
    },

    mouseDown: function(event){
        if (!this.enabled){
            CommunityBillingPlanView.$super.mouseDown.call(this, event);
            return;
        }
        this.active = true;
    },

    mouseDragged: function(event){
        var location = event.locationInView(this);
        this.active = this.bounds.containsPoint(location);
    },

    mouseUp: function(event){
        if (this.active){
            this.sendActionsForEvents(UIControl.Event.primaryAction, event);
            this.active = false;
        }
    },

    layoutSubviews: function(){
        var width = this.bounds.size.width;
        var maxSize = JSSize(width, Number.MAX_VALUE);
        var y = 0;
        this.nameLabel.sizeToFitSize(maxSize);
        var size = this.nameLabel.bounds.size;
        this.nameLabel.frame = JSRect(0, y, width, size.height);
        y += size.height;
        this.priceLabel.sizeToFitSize(maxSize);
        size = this.priceLabel.bounds.size;
        this.priceLabel.frame = JSRect(0, y, width, size.height);
        y += size.height;
        this.periodLabel.sizeToFitSize(maxSize);
        size = this.periodLabel.bounds.size;
        this.periodLabel.frame = JSRect(0, y, width, size.height);

        y = this.bounds.size.height;
        this.secondaryPeriodLabel.sizeToFitSize(maxSize);
        size = this.secondaryPeriodLabel.bounds.size;
        y -= size.height;
        this.secondaryPeriodLabel.frame = JSRect(0, y, width, size.height);
        this.secondaryPriceLabel.sizeToFitSize(maxSize);
        size = this.secondaryPriceLabel.bounds.size;
        y -= size.height;
        this.secondaryPriceLabel.frame = JSRect(0, y, width, size.height);
    },

});