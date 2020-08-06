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
// #import "BarItemButtonDetailViewController.js"
// #import "Service+Extensions.js"
'use strict';

(function(){

JSClass("BarItemSkypeDetailViewController", BarItemButtonDetailViewController, {

    initWithSpec: function(spec){
        BarItemSkypeDetailViewController.$super.initWithSpec.call(this, spec);
        this.urlSession = JSURLSession.shared;
    },

    joinURLLabel: JSOutlet(),
    meetingIdField: JSOutlet(),
    createMeetingButton: JSOutlet(),
    service: null,
    community: null,

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

    createMeeting: function(){
        this.createMeetingButton.enabled = false;
        var task = this.service.createSkypeMeeting(this.community.id, "Meet Now", function(result, meeting){
            this.createMeetingButton.enabled = true;
            if (result != Service.Result.success){
                return;
            }
            this.item.configuration.url = JSURL.initWithString(meeting.joinLink);
            this.changed = true;
        }, this);
        task.resume();
    },

    contentSizeThatFitsSize: function(maxSize){
        var size = JSSize(this.colorBar.shortcutSize * 8 + this.colorBar.shortcutSpacing * 7, 0);
        size.height += this.removeButton.intrinsicSize.height;
        size.height += this.fieldSpacing;
        size.height += this.labelField.intrinsicSize.height;
        size.height += this.fieldSpacing + this.fieldSpacing;
        size.height += this.meetingIdField.intrinsicSize.height;
        size.height += this.fieldSpacing;
        size.height += this.createMeetingButton.intrinsicSize.height;
        size.height += this.fieldSpacing + this.fieldSpacing;
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
        y += height + this.fieldSpacing + this.fieldSpacing;
        height = this.meetingIdField.intrinsicSize.height;
        this.meetingIdField.frame = JSRect(bounds.origin.x + x, bounds.origin.y + y, bounds.size.width, height);
        y += height + this.fieldSpacing;
        height = this.createMeetingButton.intrinsicSize.height;
        this.createMeetingButton.frame = JSRect(bounds.origin.x + x, bounds.origin.y + y, bounds.size.width, height);
        y += height + this.fieldSpacing + this.fieldSpacing;
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