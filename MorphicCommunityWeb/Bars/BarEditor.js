// #import UIKit
// #import "DesktopView.js"
// #import "BarView.js"
// #import "BarItemView.js"
// #import "Bar.js"
// #import "BarItemDetailViewController.js"
'use strict';

JSProtocol("BarEditorDelegate", JSProtocol, {

    barEditorDidChange: function(barEditor, index){},

});

JSClass("BarEditor", UIView, {


    initWithFrame: function(frame){
        BarEditor.$super.initWithFrame.call(this, frame);
        this._commonBarEditorInit();
    },

    initWithSpec: function(spec){
        BarEditor.$super.initWithSpec.call(this, spec);
        if (spec.containsKey("delegate")){
            this.delegate = spec.valueForKey("delegate");
        }
        this._commonBarEditorInit();
    },

    _commonBarEditorInit: function(){
        this.clipsToBounds = true;

        // The caption label gives the user a small description of what they're seeing
        this.captionLabel = UILabel.init();
        this.captionLabel.textColor = JSColor.white;
        this.captionLabel.font = JSFont.systemFontOfSize(JSFont.Size.detail);
        this.captionLabel.textAlignment = JSTextAlignment.center;
        this.captionLabel.maximumNumberOfLines = 1;
        this.captionLabel.textInsets = JSInsets(2, 10);

        // The desktop container hold both the desktop view and the simulated bar
        // and gets scaled to fit the available space
        this.desktopContainer = UIView.init();
        this.desktopContainer.anchorPoint = JSPoint.Zero;
        this.desktopContainer.clipsToBounds = true;
        this.desktopContainer.backgroundColor = JSColor.white;

        // The desktop view shows a simulated Windows desktop
        this.desktopView = DesktopView.init();

        // The bar view shows a simulated morphic bar
        this.barView = BarView.init();
        this.barView.editor = this;
        this.barView.borderColor = JSColor.black;
        this.barView.borderWidth  = 0;
        this.barView.maskedBorders = UIView.Sides.minX | UIView.Sides.maxY;
        this.barView.backgroundColor = JSColor.white;

        // The selection indicator sits behind bar items and shows which one,
        // if any, is selected
        this.selectionIndicator = UIView.init();
        this.selectionIndicator.backgroundColor = JSColor.initWithRGBA(0, 41/255.0, 87/255.0, 0.3);
        this.selectionIndicator.cornerRadius = 2;
        this.selectionIndicator.hidden = true;
        this.barView.insertSubviewAtIndex(this.selectionIndicator, 0);

        this.addSubview(this.desktopContainer);
        this.addSubview(this.captionLabel);
        this.desktopContainer.addSubview(this.desktopView);
        this.desktopContainer.addSubview(this.barView);
        this.backgroundColor = JSColor.black;
        this.setNeedsLayout();

        // For ease of use, the entire bar editor, including the simulated
        // desktop, acts as a dropzone for dragged bar items.  As seen below,
        // the bar view gets highlighted when dragging anywhere over the editor
        this.registerForDraggedTypes(["x-morphic-community/bar-item"]);
    },

    captionLabel: null,
    desktopView: null,
    barView: null,

    // MARK: - Bar

    bar: JSDynamicProperty('_bar', 1),

    setBar: function(bar){
        this._bar = bar;
        var i, l;
        for (i = this.barView.itemViews.length - 1; i >= 0; --i){
            this.barView.removeItemViewAtIndex(i);
        }
        var item, itemView;
        for (i = bar.items.length; i < l; ++i){
            item = bar.items[i];
            itemView = BarItemView.initWithItem(item);
            bar.insertItemViewAtIndex(itemView, i);
        }
    },

    // MARK: - Selection

    selectedItemIndex: JSDynamicProperty('_selectedItemIndex', -1),
    selectionIndicator: null,

    setSelectedItemIndex: function(selectedItemIndex){
        this._selectedItemIndex = selectedItemIndex;
        var view = this.viewForItemAtIndex(this._selectedItemIndex);
        if (view !== null){
            var rect = this.selectionIndicator.superview.convertRectFromView(view.bounds, view);
            this.selectionIndicator.frame = rect.rectWithInsets(JSInsets(-5));
            this.selectionIndicator.hidden = false;
        }else{
            this.selectionIndicator.hidden = true;
        }
    },

    viewForItemAtIndex: function(index){
        if (index < 0 || index >= this.barView.itemViews.length){
            return null;
        }
        return this.barView.itemViews[index];
    },

    // MARK: - Details

    itemDetailViewController: null,

    showDetailsForItemAtIndex: function(index){
        this.hideDetails();
        this.selectedItemIndex = index;
        var item = this.bar.items[index];
        var view = this.viewForItemAtIndex(index);
        this.itemDetailViewController = BarItemDetailViewController.init();
        this.itemDetailViewController.item = this.bar.items[index];
        this.itemDetailViewController.delegate = this;
        this.itemDetailViewController.popupAdjacentToView(view, UIPopupWindow.Placement.left);
    },

    hideDetails: function(){
        if (this.itemDetailViewController !== null){
            this.itemDetailViewController.dismiss();
            this.itemDetailViewController = null;
        }
    },

    barItemDetailViewDidFinishEditing: function(){
        if (this.delegate && this.delegate.barEditorDidChange){
            this.selectedItemIndex = -1;
            this.delegate.barEditorDidChange(this);
        }
    },

    draggingItemIndex: null,

    didBeginDraggingItemViewAtIndex: function(index){
        this.draggingItemIndex = index;
        var view = this.viewForItemAtIndex(index);
        this.barView.targetItemHeight = view.bounds.size.height;
        this.selectedItemIndex = -1;
    },

    didEndDraggingItemViewAtIndex: function(index, operation){
        this.barView.targetItemHeight = BarView.prototype.targetItemHeight;
        this.draggingItemIndex = null;
        if (operation === UIDragOperation.move){
            this.bar.items.splice(index, 1);
            this.barView.removeItemViewAtIndex(index);
        }
    },

    // MARK: - Drag Destination

    dragDestinationAnimator: null,

    setDragDestination: function(isDestination){
        if (this.dragDestinationAnimator !== null){
            this.dragDestinationAnimator.reverse();
        }else{
            this.dragDestinationAnimator = UIViewPropertyAnimator.initWithDuration(0.1);
            var editor = this;
            this.dragDestinationAnimator.addAnimations(function(){
                if (isDestination){
                    editor.desktopView.alpha = 0.2;
                    editor.barView.borderWidth = 2;
                }else{
                    editor.desktopView.alpha = 1;
                    editor.barView.borderWidth = 0;
                }
            });
            this.dragDestinationAnimator.addCompletion(function(){
                editor.dragDestinationAnimator = null;
            });
            this.dragDestinationAnimator.start();
        }
    },

    draggingEntered: function(session){
        if (session.pasteboard.containsType("x-morphic-community/bar-item")){
            this.setDragDestination(true);
            this.updateItemDropLocation(session);
            if (this.draggingItemIndex !== null){
                return UIDragOperation.move;
            }
            return UIDragOperation.copy;
        }
        return UIDragOperation.none;
    },

    draggingUpdated: function(session){
        this.updateItemDropLocation(session);
        if (this.draggingItemIndex !== null){
            return UIDragOperation.move;
        }
        return UIDragOperation.copy;
    },

    draggingExited: function(session){
        this.setDragDestination(false);
        this.updateItemDropLocation(session, true);
    },

    dropLocationAnimator: null,

    updateItemDropLocation: function(session, exited){
        var barLocation = this.barView.convertPointFromScreen(session.screenLocation);
        var oldIndex = this.barView.targetItemViewIndex;
        var newIndex = exited ? -1 : this.barView.targetItemViewIndexForLocation(barLocation);
        if (newIndex !== oldIndex){
            if (this.dropLocationAnimator !== null){
                this.dropLocationAnimator.stop();
                // FIXME: stop animation and set model to current presentation values
            }
            var editor = this;
            this.barView.targetItemViewIndex = newIndex;
            this.dropLocationAnimator = UIViewPropertyAnimator.initWithDuration(0.1);
            this.dropLocationAnimator.addAnimations(function(){
                editor.barView.layoutIfNeeded();
            });
            this.dropLocationAnimator.addCompletion(function(){
                editor.dropLocationAnimator = null;
            });
            this.dropLocationAnimator.start();
        }
    },

    performDragOperation: function(session, operation){
        this.setDragDestination(false);

        var index = this.barView.targetItemViewIndex;

        var itemDictionary = session.pasteboard.objectForType("x-morphic-community/bar-item");
        var item = BarItem.initWithDictionary(itemDictionary);
        this.bar.items.splice(index, 0, item);

        var itemView = BarItemView.initWithItem(item);
        this.barView.insertItemViewAtIndex(itemView, index);
        this.barView.targetItemViewIndex = -1;

        var editor = this;
        var animator = UIViewPropertyAnimator.initWithDuration(0.1);
        animator.addAnimations(function(){
            editor.barView.layoutIfNeeded();
        });

        if (operation === UIDragOperation.copy){
            this.showDetailsForItemAtIndex(index);
        }
    },

    // MARK: - Layout

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

    // MARK: - Zooming

    zoomed: false,

    mouseDown: function(event){
        if (event.hasModifier(UIEvent.Modifier.command)){
            this.zoomed = !this.zoomed;
            this.setNeedsLayout();
        }
    }

});