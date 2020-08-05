// #import UIKit
'use strict';

JSClass("ColorBar", UIControl, {

    color: JSDynamicProperty('_color', null),
    shortcutColors: JSDynamicProperty('_shortcutColors', null),
    shortcutRows: 1,
    shortcutSize: 19,
    shortcutSpacing: 6,
    shortcutColorViews: null,
    selectionIndicator: null,

    initWithSpec: function(spec){
        ColorBar.$super.initWithSpec.call(this, spec);
        this.shortcutColorViews = [];
        if (spec.containsKey("shortcutColors")){
            this._shortcutColors = [];
            var shortcutColors = spec.valueForKey("shortcutColors");
            for (var i = 0, l = shortcutColors.length; i < l; ++i){
                this._shortcutColors.push(shortcutColors.valueForKey(i, JSColor));
            }
            this.updateShortcutViews();
        }
        if (spec.containsKey("shortcutRows")){
            this.shortcutRows = spec.valueForKey("shortcutRows");
        }
        if (spec.containsKey("shortcutSize")){
            this.shortcutSize = spec.valueForKey("shortcutSize");
        }
        if (spec.containsKey("shortcutSpacing")){
            this.shortcutSpacing = spec.valueForKey("shortcutSpacing");
        }
        this.commonColorBarInit();
    },

    initWithFrame: function(frame){
        ColorBar.$super.initWithFrame.call(this, frame);
        this.shortcutColorViews = [];
        this.commonColorBarInit();
    },

    commonColorBarInit: function(){
        this.selectionIndicator = UIView.init();
        this.selectionIndicator.backgroundColor = JSColor.initWithRGBA(0, 128/255.0, 255/255.0, 0.75);
        this.addSubview(this.selectionIndicator);
        this.startMouseTracking(UIView.MouseTracking.all);
    },

    setColor: function(color){
        this._color = color;
        if (color !== null){
            this.selectionIndicator.backgroundColor = color.colorWithAlpha(0.4);
        }
        this.setNeedsLayout();
    },

    setShortcutColors: function(colors){
        this._shortcutColors = JSCopy(colors);
        this.updateShortcutViews();
    },

    updateShortcutViews: function(){
        var color;
        var view;
        for (var i = 0, l = this._shortcutColors.length; i < l; ++i){
            color = this._shortcutColors[i];
            if (i < this.shortcutColorViews.length){
                view = this.shortcutColorViews[i];
            }else{
                view = ColorBarColorView.init();
                this.addSubview(view);
                this.shortcutColorViews.push(view);
            }
            view.color = color;
        }
        for (var j = this.shortcutColorViews.length - 1; j >= i; --j){
            this.shortcutColorViews[j].removeFromSuperview();
            this.shortcutColorViews.splice(j, 1);
        }
        this.setNeedsLayout();
    },

    overShortcut: null,

    mouseEntered: function(event){
    },

    mouseMoved: function(event){
        var location = event.locationInView(this);
        var shortcut = this.unselectedShortcutAtLocation(location);
        if (shortcut !== this.overShortcut){
            if (this.overShortcut !== null){
                this.overShortcut.highlighted = false;
            }
            this.overShortcut = shortcut;
            if (this.overShortcut !== null){
                this.overShortcut.highlighted = true;
            }
        }
    },

    mouseExited: function(event){
        if (this.overShortcut !== null){
            this.overShortcut.highlighted = false;
            this.overShortcut = null;
        }
    },

    mouseDown: function(event){
        var location = event.locationInView(this);
        var shortcut = this.unselectedShortcutAtLocation(location);
        if (shortcut !== null){
            this.activeShortcut = shortcut;
            shortcut.active = true;
        }
    },

    activeShortcut: null,

    mouseDragged: function(event){
        var location = event.locationInView(this);
        var shortcut = this.unselectedShortcutAtLocation(location);
        if (shortcut !== this.activeShortcut){
            if (this.activeShortcut !== null){
                this.activeShortcut.active = false;
            }
            this.activeShortcut = shortcut;
            if (this.activeShortcut !== null){
                this.activeShortcut.active = true;
            }
        }
    },

    mouseUp: function(event){
        var location = event.locationInView(this);
        if (this.activeShortcut !== null){
            this.color = this.activeShortcut.color;
            this.activeShortcut.active = false;
            this.activeShortcut = null;
            this.didChangeValueForBinding('color');
            this.sendActionsForEvents(UIControl.Event.primaryAction | UIControl.Event.valueChanged, event);
        }
    },

    unselectedShortcutAtLocation: function(location){
        var hit = this.hitTest(location);
        if (hit instanceof ColorBarColorView){
            if (!hit.color.isEqual(this.color)){
                return hit;
            }
        }
        return null;
    },

    getIntrinsicSize: function(){
        return JSSize(UIView.noIntrinsicSize, this.shortcutSpacing + this.shortcutRows * (this.shortcutSize + this.shortcutSpacing));
    },

    layoutSubviews: function(){
        var bounds = this.bounds.rectWithInsets(this.shortcutSpacing, 0);
        var origin = JSPoint(bounds.origin);
        var view;
        var shortcutSize = JSSize(this.shortcutSize, this.shortcutSize);
        var i, l;
        this.selectionIndicator.hidden = true;
        for (i = 0, l = this.shortcutColorViews.length; i < l; ++i){
            view = this.shortcutColorViews[i];
            view.hidden = false;
            view.frame = JSRect(origin, shortcutSize);
            view.cornerRadius = shortcutSize.height / 2;
            if (view.color.isEqual(this.color)){
                this.selectionIndicator.frame = view.frame.rectWithInsets(-3);
                this.selectionIndicator.cornerRadius = this.selectionIndicator.frame.size.height / 2;
                this.selectionIndicator.hidden = false;
            }
            origin.x += shortcutSize.width + this.shortcutSpacing;
            if (origin.x > bounds.origin.x + bounds.size.width - shortcutSize.width){
                origin.x = bounds.origin.x;
                origin.y += shortcutSize.height + this.shortcutSpacing;
                if (origin.y > bounds.origin.y + bounds.size.height - shortcutSize.height){
                    ++i;
                    break;
                }
            }
        }
        for (; i < l; ++i){
            view = this.shortcutColorViews[i];
            view.hidden = true;
        }
    },

});

JSClass("ColorBarColorView", UIView, {

    initWithFrame: function(frame){
        ColorBarColorView.$super.initWithFrame.call(this, frame);
        this.borderWidth = 1;
        this.borderColor = JSColor.clear;
    },

    highlighted: JSDynamicProperty('_highlighted'),
    active: JSDynamicProperty('_highlighted'),
    color: JSDynamicProperty('_color'),

    setColor: function(color){
        this._color = color;
        this.update();
    },

    setHighlighted: function(highlighted){
        this._highlighted = highlighted;
        this.update();
    },

    setActive: function(active){
        this._active = active;
        this.update();
    },

    update: function(){
        if (this._active){
            this.backgroundColor = this._color.colorDarkenedByPercentage(0.3);
            this.borderColor = this._color.colorDarkenedByPercentage(0.5);
        }else{
            this.borderColor = this._color.colorDarkenedByPercentage(0.2);
            if (this._highlighted){
                this.backgroundColor = this._color.colorLightenedByPercentage(0.2);
            }else{
                this.backgroundColor = this._color;
            }
        }
    },

    hitTest: function(location){
        if (location.distanceToPoint(this.bounds.center) <= this.bounds.size.height / 2){
            return this;
        }
        return null;
    },

});