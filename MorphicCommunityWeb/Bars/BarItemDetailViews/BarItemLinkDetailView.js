// #import UIKit
// #import "BarItemDetailView.js"
// #import "Theme.js"
// #import "ColorBar.js"
'use strict';

JSClass("BarItemLinkDetailView", BarItemDetailView, {

    initWithFrame: function(frame){
        BarItemLinkDetailView.$super.initWithFrame.call(this, frame);
        this.contentInsets = JSInsets(10);
        this.labelField = UITextField.initWithStyler(Theme.default.itemDetailTextFieldStyler);
        this.labelField.placeholder = JSBundle.mainBundle.localizedString("label.placeholder", "BarItemDetailViews");
        this.addSubview(this.labelField);

        this.urlField = UITextField.initWithStyler(Theme.default.itemDetailTextFieldStyler);
        this.urlField.placeholder = JSBundle.mainBundle.localizedString("url.placeholder", "BarItemDetailViews");
        this.addSubview(this.urlField);

        this.colorBar = ColorBar.init();
        this.addSubview(this.colorBar);

        this.initialFirstResponder = this.labelField;
        this.labelField.nextKeyView = this.urlField;
        this.urlField.nextKeyView = this.labelField;
    },

    contentInsets: null,
    labelField: null,
    urlField: null,
    fieldSpacing: 7,

    getIntrinsicSize: function(){
        var size = JSSize(UIView.noIntrinsicSize, this.contentInsets.height);
        size.height += this.removeButton.intrinsicSize.height;
        size.height += this.labelField.intrinsicSize.height;
        size.height += this.fieldSpacing;
        size.height += this.urlField.intrinsicSize.height;
        size.height += this.fieldSpacing;
        size.height += this.colorBar.intrinsicSize.height;
        return size;
    },

    layoutSubviews: function(){
        var bounds = this.bounds.rectWithInsets(this.contentInsets);
        var height = this.labelField.intrinsicSize.height;
        var x = 0;
        var y = 0;
        var buttonSize = this.removeButton.intrinsicSize;
        this.removeButton.frame = JSRect(bounds.origin.x + bounds.size.width - buttonSize.width, y, buttonSize.width, buttonSize.height);
        y += buttonSize.height;
        this.labelField.frame = JSRect(bounds.origin.x + x, bounds.origin.y + y, bounds.size.width, height);
        y += height + this.fieldSpacing;
        height = this.urlField.intrinsicSize.height;
        this.urlField.frame = JSRect(bounds.origin.x + x, bounds.origin.y + y, bounds.size.width, height);
        y += height + this.fieldSpacing;
        height = this.colorBar.intrinsicSize.height;
        this.colorBar.frame = JSRect(bounds.origin.x + x, bounds.origin.y + y, bounds.size.width, height);
    }

});