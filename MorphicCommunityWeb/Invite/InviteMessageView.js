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

JSClass("InviteMessageView", UIScrollView, {

    messageField: null,

    initWithFrame: function(frame){
        InviteMessageView.$super.initWithFrame.call(this, frame);
        this.pageContentInsets = JSInsets(40);
        this.commonInviteMessageViewInit();
    },

    initWithSpec: function(spec){
        InviteMessageView.$super.initWithSpec.call(this, spec);
        this.commonInviteMessageViewInit();
        if (spec.containsKey("messageField")){
            this.messageField = spec.valueForKey("messageField");
            this.messageField.setNeedsLayout();
            this.pageView.addSubview(this.messageField);
        }
        if (spec.containsKey("pageContentInsets")){
            this.pageContentInsets = spec.valueForKey("pageContentInsets", JSInsets);
        }else{
            this.pageContentInsets = JSInsets(40);
        }
        if (spec.containsKey("pageWidth")){
            this.pageWidth = spec.valueForKey("pageWidth");
        }
    },

    commonInviteMessageViewInit: function(){
        this.clipsToBounds = true;
        this.backgroundView = UIView.init();
        this.backgroundView.backgroundColor = JSColor.initWithWhite(0.96);
        this.pageView = UIView.init();
        this.pageView.backgroundColor = JSColor.white;
        this.pageView.shadowColor = JSColor.black.colorWithAlpha(0.2);
        this.pageView.shadowRadius = 5;
        this.headerLabel = UILabel.init();
        this.headerLabel.font = JSFont.systemFontOfSize(JSFont.Size.heading);
        this.headerLabel.maximumNumberOfLines = 0;
        this.headerLabel.textAlignment = JSTextAlignment.center;
        this.introductionLabel = UILabel.init();
        this.introductionLabel.maximumNumberOfLines = 0;
        this.introductionLabel.textAlignment = JSTextAlignment.center;
        var styler = UIButtonCustomStyler.initWithBackgroundColor(JSColor.initWithRGBA(0, 129/255.0, 69/255.0), JSColor.white);
        this.actionButton = UIButton.initWithStyler(styler);
        this.actionButton.titleLabel.text = "Download Morphic Community";
        this.actionButton.titleInsets = JSInsets(10, 20);

        this.contentView.addSubview(this.backgroundView);
        this.contentView.addSubview(this.pageView);
        this.pageView.addSubview(this.headerLabel);
        this.pageView.addSubview(this.introductionLabel);
        this.pageView.addSubview(this.actionButton);
    },

    backgroundView: null,
    pageView: null,
    headerLabel: null,
    introductionLabel: null,
    actionButton: null,
    pageWidth: 400,
    pageContentInsets: null,

    layoutSubviews: function(){
        InviteMessageView.$super.layoutSubviews.call(this);
        var pageContentMaxSize = JSSize(this.pageWidth - this.pageContentInsets.width, Number.MAX_VALUE);

        var origin = JSPoint(this.pageContentInsets.left, this.pageContentInsets.top);
        this.headerLabel.sizeToFitSize(pageContentMaxSize);
        this.headerLabel.frame = JSRect(origin, JSSize(pageContentMaxSize.width, this.headerLabel.bounds.size.height));
        origin.y += this.headerLabel.bounds.size.height + 30;

        this.introductionLabel.sizeToFitSize(pageContentMaxSize);
        this.introductionLabel.frame = JSRect(origin, JSSize(pageContentMaxSize.width, this.introductionLabel.bounds.size.height));
        origin.y += this.headerLabel.bounds.size.height + 30;

        this.messageField.frame = JSRect(origin, JSSize(pageContentMaxSize.width, this.messageField.bounds.size.height));
        origin.y += this.messageField.bounds.size.height + 30;

        this.actionButton.sizeToFit();
        this.actionButton.position = JSPoint(origin.x + pageContentMaxSize.width / 2, origin.y + this.actionButton.bounds.size.height / 2);
        origin.y += this.actionButton.bounds.size.height;

        var pageSize = JSSize(this.pageWidth, origin.y + this.pageContentInsets.bottom);
        var contentSize = JSSize(this.bounds.size.width, pageSize.height);
        this.backgroundView.frame = JSRect(JSPoint.Zero, contentSize);
        this.pageView.frame = JSRect(JSPoint((this.bounds.size.width - pageSize.width) / 2, 0), pageSize);
        this.contentSize = contentSize;
    },

});

UITextField.definePropertiesFromExtensions({

    sizeToFitSize: function(maxSize){
        if (this._multiline){
            var size = JSSize(maxSize);
            if (size.width < Number.MAX_VALUE){
                size.width -= this._textInsets.width;
            }
            if (size.height < Number.MAX_VALUE){
                size.height -= this._textInsets.height;
            }
            this._textLayer.sizeToFitSize(size);
        }
    }

});