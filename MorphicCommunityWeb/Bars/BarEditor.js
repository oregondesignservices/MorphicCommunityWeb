// #import UIKit
// #import "DesktopView.js"
// #import "BarView.js"
// #import "BarItemView.js"
'use strict';

JSProtocol("BarEditorDelegate", JSProtocol, {

    barEditorDidInsertItemAtIndex: function(barEditor, index){},
    barEditorDidRemoveItemAtIndex: function(barEditor, index){},
    barEditorDidChangeItemAtIndex: function(barEditor, index){}

});

JSClass("BarEditor", UIView, {

    initWithSpec: function(spec){
        BarEditor.$super.initWithSpec.call(this, spec);
        if (spec.containsKey("delegate")){
            this.delegate = spec.valueForKey("delegate");
        }
        this.clipsToBounds = true;
        this.captionLabel = UILabel.init();
        this.captionLabel.textColor = JSColor.white;
        this.captionLabel.font = JSFont.systemFontOfSize(JSFont.Size.detail);
        this.captionLabel.textAlignment = JSTextAlignment.center;
        this.captionLabel.maximumNumberOfLines = 1;
        this.captionLabel.textInsets = JSInsets(2, 10);
        this.desktopContainer = UIView.init();
        this.desktopContainer.anchorPoint = JSPoint.Zero;
        this.desktopContainer.clipsToBounds = true;
        this.desktopContainer.backgroundColor = JSColor.white;
        this.desktopView = DesktopView.init();
        this.barView = BarView.init();
        this.barView.borderColor = JSColor.black;
        this.barView.borderWidth  = 0;
        this.barView.maskedBorders = UIView.Sides.minX | UIView.Sides.maxY;
        this.barView.backgroundColor = JSColor.white;

        this.addSubview(this.desktopContainer);
        this.addSubview(this.captionLabel);
        this.desktopContainer.addSubview(this.desktopView);
        this.desktopContainer.addSubview(this.barView);
        this.backgroundColor = JSColor.black;
        this.setNeedsLayout();
        this.registerForDraggedTypes(["x-morphic-community/bar-item"]);
    },

    captionLabel: null,
    desktopView: null,
    barView: null,
    barWidth: 120,
    desktopHeight: 800,

    layoutSubviews: function(){
        var captionHeight = this.captionLabel.intrinsicSize.height;
        var bounds = this.bounds.rectWithInsets(2, 2, 2, 2);
        this.captionLabel.frame = JSRect(bounds.origin.x, bounds.origin.y + bounds.size.height - captionHeight, bounds.size.width, captionHeight);
        bounds.size.height -= captionHeight;
        var desktopSize = JSSize(0, this.desktopHeight);
        var scale = bounds.size.height / desktopSize.height;
        desktopSize.width = Math.round(bounds.size.width / scale);
        this.desktopContainer.bounds = JSRect(JSPoint.Zero, desktopSize);
        this.desktopContainer.position = bounds.origin;
        this.desktopContainer.transform = this.zoomed ? JSAffineTransform.Translated(bounds.size.width - this.desktopContainer.bounds.size.width, 0) : JSAffineTransform.Scaled(scale, scale);
        this.desktopView.frame = this.desktopContainer.bounds;
        this.barView.frame = JSRect(this.desktopContainer.bounds.size.width - this.barWidth, 0, this.barWidth, this.desktopContainer.bounds.size.height - this.desktopView.taskbarHeight);
    },

    dragDestinationAnimator: null,

    toggleDragDestination: function(){

    },

    draggingEntered: function(session){
        if (session.pasteboard.containsType("x-morphic-community/bar-item")){
            if (this.dragDestinationAnimator !== null){
                this.dragDestinationAnimator.reverse();
            }else{
                this.dragDestinationAnimator = UIViewPropertyAnimator.initWithDuration(0.1);
                var editor = this;
                this.dragDestinationAnimator.addAnimations(function(){
                    editor.desktopView.alpha = 0.2;
                    editor.barView.borderWidth = 2;
                });
                this.dragDestinationAnimator.addCompletion(function(){
                    editor.dragDestinationAnimator = null;
                });
                this.dragDestinationAnimator.start();
            }
            return UIDragOperation.copy;
        }
        return UIDragOperation.none;
    },

    draggingUpdated: function(session){
        return UIDragOperation.copy;
    },

    draggingExited: function(session){
        if (this.dragDestinationAnimator !== null){
            this.dragDestinationAnimator.reverse();
        }else{
            this.dragDestinationAnimator = UIViewPropertyAnimator.initWithDuration(0.1);
            var editor = this;
            this.dragDestinationAnimator.addAnimations(function(){
                editor.desktopView.alpha = 1;
                editor.barView.borderWidth = 0;
            });
            this.dragDestinationAnimator.addCompletion(function(){
                editor.dragDestinationAnimator = null;
            });
            this.dragDestinationAnimator.start();
        }
    },

    performDragOperation: function(session){
        this.draggingExited(session);
        var item = session.pasteboard.objectForType("x-morphic-community/bar-item");
        var itemView = BarItemView.init();
        itemView.titleLabel.text = "Title";
        this.barView.addItemView(itemView);
    },

    zoomed: false,

    mouseDown: function(event){
        if (event.hasModifier(UIEvent.Modifier.command)){
            this.zoomed = !this.zoomed;
            this.setNeedsLayout();
        }
    }

});