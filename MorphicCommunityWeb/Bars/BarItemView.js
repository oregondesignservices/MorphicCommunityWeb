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
        this.titleLabel.bind("text", item.configuration, "label");
        this.titleLabel.bind("backgroundColor", item.configuration, "color", {nullPlaceholder: this.defaultColor});
        this.imageBorderView.bind("backgroundColor", item.configuration, "color", {nullPlaceholder: this.defaultColor});
        this.imageView.bind("templateColor", item.configuration, "color", {nullPlaceholder: this.defaultColor});
        this.imageView.bind("image", item.configuration, "imageURL", {valueTransformer: {
            transformValue: function(url){
                if (url === null){
                    return null;
                }
                if (url.isAbolute){
                    return JSImage.initWithURL(url);
                }
                return JSImage.initWithResourceName(url.path).imageWithRenderMode(JSImage.RenderMode.template);
            }
        }});
        this.imageView.bind("hidden", item.configuration, "imageURL=null");
        this.imageBorderView.bind("hidden", item.configuration, "imageURL=null");
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