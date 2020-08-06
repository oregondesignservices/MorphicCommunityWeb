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
// #import "Bar.js"
'use strict';

JSClass("BarItemView", UIView, {

    initWithItem: function(item){
        var view = null;
        switch (item.kind){
            case BarItem.Kind.action:
                view = BarItemControlView.init();
                break;
            case BarItem.Kind.link:
            case BarItem.Kind.application:
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

    setItem: function(item){
        this._item = item;
        this.update();
    },

    update: function(){
    },

    dragging: false,

    mouseDown: function(event){
        this.editor.selectedItemIndex = this.index;
    },

    mouseDragged: function(event){
        var dragItems = [
            {
                type: "x-morphic-community/bar-item",
                objectValue: this.item.dictionaryRepresentation()
            }
        ];
        var session = this.beginDraggingSessionWithItems(dragItems, event);
        if (session){
            session.allowedOperations = UIDragOperation.copy | UIDragOperation.move;
        }
    },

    draggingSessionDidBecomeActive: function(session){
        this.alpha = 0;
        this.dragging = true;
        this.editor.didBeginDraggingItemViewAtIndex(this.index);
    },

    draggingSessionEnded: function(session, operation){
        this.alpha = 1;
        this.editor.didEndDraggingItemViewAtIndex(this.index, operation);
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
    defaultColor: JSColor.initWithRGBA(0, 41/255.0, 87/255.0),

    init: function(){
        BarItemButtonView.$super.init.call(this);
        this.titleLabel = UILabel.init();
        this.titleLabel.maximumNumberOfLines = 2;
        this.titleLabel.font = JSFont.systemFontOfSize(14);
        this.titleLabel.textInsets = JSInsets(10);
        this.titleLabel.backgroundColor = this.defaultColor;
        this.titleLabel.textAlignment = JSTextAlignment.center;
        this.titleLabel.textColor = JSColor.white;
        this.imageBorderView = UIView.init();
        this.imageBorderView.backgroundColor = this.defaultColor;
        this.imageView = UIImageView.init();
        this.imageView.backgroundColor = JSColor.white;
        this.imageView.borderColor = JSColor.white;
        this.imageView.borderWidth = 2;
        this.imageView.templateColor = this.defaultColor;
        this.imageView.scaleMode = UIImageView.ScaleMode.aspectFill;
        this.addSubview(this.titleLabel);
        this.addSubview(this.imageBorderView);
        this.addSubview(this.imageView);
    },

    update: function(){
        var item = this._item;
        this.titleLabel.bind("text", item, "configuration.label");
        this.titleLabel.bind("backgroundColor", item, "configuration.color", {nullPlaceholder: this.defaultColor});
        this.imageBorderView.bind("backgroundColor", item, "configuration.color", {nullPlaceholder: this.defaultColor});
        this.imageView.bind("templateColor", item, "configuration.color", {nullPlaceholder: this.defaultColor});
        this.imageView.bind("image", item, "configuration.imageURL", {valueTransformer: {
            transformValue: function(url){
                if (url === null){
                    return null;
                }
                if (url.isAbolute){
                    return JSImage.initWithURL(url, JSSize(32, 32));
                }
                return JSImage.initWithResourceName(url.path).imageWithRenderMode(JSImage.RenderMode.template);
            }
        }});
        this.imageView.bind("hidden", item, "configuration.imageURL==null");
        this.imageBorderView.bind("hidden", item, "configuration.imageURL==null");
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

JSClass("BarItemControlView", BarItemView, {

    titleLabel: null,
    segmentsContainer: null,
    defaultColor: JSColor.initWithRGBA(0, 129/255.0, 69/255.0),

    init: function(){
        BarItemControlView.$super.init.call(this);
        this.titleLabel = UILabel.init();
        this.titleLabel.maximumNumberOfLines = 1;
        this.titleLabel.font = JSFont.systemFontOfSize(14);
        this.titleLabel.textInsets = JSInsets(5, 0);
        this.titleLabel.textAlignment = JSTextAlignment.center;
        this.titleLabel.textColor = JSColor.black;
        this.segmentsContainer = UIStackView.initWithFrame(JSRect(0, 0, 0, 30));
        this.segmentsContainer.axis = UIStackView.Axis.horizontal;
        this.segmentsContainer.viewSpacing = 1;
        this.segmentsContainer.distribution = UIStackView.Distribution.equal;
        this.addSubview(this.titleLabel);
        this.addSubview(this.segmentsContainer);
    },

    update: function(){
        var i;
        for (i = this.segmentsContainer.subviews.length - 1; i >= 0; --i){
            this.segmentsContainer.subviews[i].removeFromSuperview();
        }
        var item = this._item;
        switch (item.configuration.identifier){
            case "copy-paste":
                this.titleLabel.text = "Copy & Paste";
                this.addTextSegment("Copy");
                this.addTextSegment("Paste");
                break;
            case "screen-zoom":
                this.titleLabel.text = "Screen Zoom";
                this.addImageSegment("ControlPlus");
                this.addImageSegment("ControlMinus");
                break;
            case "magnify":
                this.titleLabel.text = "Magnifier";
                this.addTextSegment("On");
                this.addTextSegment("Off");
                break;
            case "volume":
                this.titleLabel.text = "Volume";
                this.addImageSegment("ControlPlus");
                this.addImageSegment("ControlMinus");
                break;
            default:
                this.titleLabel.text = "Unknown";
                this.addTextSegment("Unknown");
                break;
        }
        for (i = this.segmentsContainer.subviews.length - 1; i >= 0; --i){
            this.segmentsContainer.subviews[i].bind("backgroundColor", item, "configuration.color", {nullPlaceholder: this.defaultColor});
        }
    },

    addTextSegment: function(title){
        var segment = BarItemControlSegmentView.init();
        segment.titleLabel.text = title;
        this.segmentsContainer.addSubview(segment);
    },

    addImageSegment: function(imageName){
        var segment = BarItemControlSegmentView.init();
        segment.imageView.image = JSImage.initWithResourceName(imageName);
        this.segmentsContainer.addSubview(segment);
    },

    sizeToFitSize: function(maxSize){
        this.bounds = JSRect(0, 0, maxSize.width, this.titleLabel.intrinsicSize.height + this.segmentsContainer.bounds.size.height);
        this.setNeedsLayout();
    },

    layoutSubviews: function(){
        var y = 0;
        this.titleLabel.frame = JSRect(0, y, this.bounds.size.width, this.titleLabel.intrinsicSize.height);
        y += this.titleLabel.bounds.size.height;
        this.segmentsContainer.frame = JSRect(0, y, this.bounds.size.width, this.segmentsContainer.bounds.size.height);
    }

});

JSClass("BarItemControlSegmentView", UIView, {

    titleLabel: null,
    imageView: null,

    initWithFrame: function(frame){
        BarItemControlSegmentView.$super.initWithFrame.call(this, frame);
        this.titleLabel = UILabel.init();
        this.titleLabel.textAlignment = JSTextAlignment.center;
        this.titleLabel.maximumNumberOfLines = 1;
        this.titleLabel.textColor = JSColor.white;
        this.imageView = UIImageView.init();
        this.imageView.automaticRenderMode = JSImage.RenderMode.template;
        this.imageView.templateColor = JSColor.white;
        this.imageView.scaleMode = UIImageView.ScaleMode.aspectFit;
        this.addSubview(this.titleLabel);
        this.addSubview(this.imageView);
    },

    layoutSubviews: function(){
        this.titleLabel.textInsets = JSInsets((this.bounds.size.height - this.titleLabel.intrinsicSize.height) / 2, 0);
        this.imageView.contentInsets = JSInsets(this.bounds.size.height / 4, 0);
        this.titleLabel.frame = this.bounds;
        this.imageView.frame = this.bounds;
    }
    

});