// #import UIKit
// #import "BarItemDetailView.js"
// #import "Theme.js"
// #import "ColorBar.js"
// #import "ImagePicker.js"
'use strict';

JSClass("BarItemLinkDetailView", BarItemDetailView, {

    initWithFrame: function(frame){
        BarItemLinkDetailView.$super.initWithFrame.call(this, frame);
        this.labelField = UITextField.initWithStyler(Theme.default.itemDetailTextFieldStyler);
        this.labelField.placeholder = JSBundle.mainBundle.localizedString("label.placeholder", "BarItemDetailViews");
        this.addSubview(this.labelField);

        this.urlField = UITextField.initWithStyler(Theme.default.itemDetailTextFieldStyler);
        this.urlField.placeholder = JSBundle.mainBundle.localizedString("url.placeholder", "BarItemDetailViews");
        this.addSubview(this.urlField);

        this.colorBar = ColorBar.init();
        this.addSubview(this.colorBar);

        this.imagePicker = ImagePicker.init();
        this.addSubview(this.imagePicker);

        this.initialFirstResponder = this.labelField;
        this.labelField.nextKeyView = this.urlField;
        this.urlField.nextKeyView = this.labelField;
    },

    labelField: null,
    urlField: null,
    colorBar: null,
    imagePicker: null,
    fieldSpacing: 7,

    getIntrinsicSize: function(){
        var size = JSSize(this.contentInsets.width + this.colorBar.shortcutSize * 8 + this.colorBar.shortcutSpacing * 7, this.contentInsets.height);
        size.height += this.removeButton.intrinsicSize.height;
        size.height += this.labelField.intrinsicSize.height;
        size.height += this.fieldSpacing;
        size.height += this.urlField.intrinsicSize.height;
        size.height += this.fieldSpacing;
        size.height += this.colorBar.intrinsicSize.height;
        var imagePickerSize = this.imagePicker.sizeThatFitsSize(JSSize(size.width, Number.MAX_VALUE));
        size.height += this.fieldSpacing;
        size.height += imagePickerSize.height;
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
        y += height + this.fieldSpacing;
        var imagePickerSize = this.imagePicker.sizeThatFitsSize(JSSize(bounds.size.width, Number.MAX_VALUE));
        this.imagePicker.frame = JSRect(bounds.origin.x + x, bounds.origin.y + y, bounds.size.width, imagePickerSize.height);
    }

});