// #import UIKit
// #import "BarItemButtonDetailViewController.js"
'use strict';

(function(){

JSClass("BarItemSkypeDetailViewController", BarItemButtonDetailViewController, {

    joinURLLabel: JSOutlet(),
    meetingIdField: JSOutlet(),

    viewDidLoad: function(){
        BarItemSkypeDetailViewController.$super.viewDidLoad.call(this);
        this.joinURLLabel.sizeToFit();
        var insets = JSInsets(this.meetingIdField.textInsets);
        insets.left = -1;
        this.meetingIdField.textInsets = insets;
        this.meetingIdField.leftAccessorySize = this.joinURLLabel.bounds.size;
    },

    viewWillAppear: function(animated){
        BarItemSkypeDetailViewController.$super.viewWillAppear.call(this, animated);
    },

    viewDidAppear: function(animated){
        BarItemSkypeDetailViewController.$super.viewDidAppear.call(this, animated);
        this.view.window.firstResponder = this.labelField;
    },

    viewWillDisappear: function(animated){
        BarItemSkypeDetailViewController.$super.viewWillDisappear.call(this, animated);
    },

    viewDidDisappear: function(animated){
        BarItemSkypeDetailViewController.$super.viewDidDisappear.call(this, animated);
    },

    contentSizeThatFitsSize: function(maxSize){
        var size = JSSize(this.colorBar.shortcutSize * 8 + this.colorBar.shortcutSpacing * 7, 0);
        size.height += this.removeButton.intrinsicSize.height;
        size.height += this.fieldSpacing;
        size.height += this.labelField.intrinsicSize.height;
        size.height += this.fieldSpacing;
        size.height += this.meetingIdField.intrinsicSize.height;
        size.height += this.fieldSpacing;
        size.height += this.colorBar.intrinsicSize.height;
        var imagePickerSize = this.imagePicker.sizeThatFitsSize(JSSize(size.width, Number.MAX_VALUE));
        size.height += this.fieldSpacing;
        size.height += imagePickerSize.height;
        return size;
    },

    viewDidLayoutSubviews: function(){
        var bounds = this.view.bounds;
        var height = this.labelField.intrinsicSize.height;
        var x = 0;
        var y = 0;
        var buttonSize = this.removeButton.intrinsicSize;
        this.removeButton.frame = JSRect(bounds.origin.x + bounds.size.width - buttonSize.width, y, buttonSize.width, buttonSize.height);
        y += buttonSize.height + this.fieldSpacing;
        this.labelField.frame = JSRect(bounds.origin.x + x, bounds.origin.y + y, bounds.size.width, height);
        y += height + this.fieldSpacing;
        height = this.meetingIdField.intrinsicSize.height;
        this.meetingIdField.frame = JSRect(bounds.origin.x + x, bounds.origin.y + y, bounds.size.width, height);
        y += height + this.fieldSpacing;
        height = this.colorBar.intrinsicSize.height;
        this.colorBar.frame = JSRect(bounds.origin.x + x, bounds.origin.y + y, bounds.size.width, height);
        y += height + this.fieldSpacing;
        var imagePickerSize = this.imagePicker.sizeThatFitsSize(JSSize(bounds.size.width, Number.MAX_VALUE));
        this.imagePicker.frame = JSRect(bounds.origin.x + x, bounds.origin.y + y, bounds.size.width, imagePickerSize.height);
    }

});

BarItemSkypeDetailViewController.URLToMeetingIdValueTransformer = {
    transformValue: function(url){
        if (url === null || url.pathComponents.length < 2){
            return null;
        }
        return url.pathComponents[1];
    },

    reverseTransformValue: function(string){
        return JSURL.initWithString("https://join.skype.com/").appendingPathComponent(string);
    }
};

JSClass("MeetingIdField", UITextField, {

    pasteAndMatchStyle: function(){
        if (UIPasteboard.general.containsType(UIPasteboard.ContentType.plainText)){
            var text = UIPasteboard.general.stringForType(UIPasteboard.ContentType.plainText);
            if (text.startsWith("https://join.skype.com/")){
                text = text.substr(23);
            }else if (text.startsWith("join.skype.com/")){
                text = text.substr(15);
            }
            this._localEditor.insertText(text);
        }
    },

});

})();