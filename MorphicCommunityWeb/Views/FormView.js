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

JSClass("FormView", UIView, {

    fields: null,
    fieldSpacing: 0,
    labelSpacing: 0,
    separatorColor: null,
    maximumLabelSize: Number.MAX_VALUE,

    initWithFrame: function(frame){
        FormView.$super.initWithFrame.call(this, frame);
        this.fields = [];
    },

    initWithSpec: function(spec){
        FormView.$super.initWithSpec.call(this, spec);
        this.fields = [];
        if (spec.containsKey("separatorColor")){
            this.separatorColor = spec.valueForKey("separatorColor", JSColor);
        }
        if (spec.containsKey("fields")){
            var fields = spec.valueForKey("fields");
            var fieldSpec;
            var label;
            var view;
            var extraSpacing;
            for (var i = 0, l = fields.length; i < l; ++i){
                fieldSpec = fields.valueForKey(i);
                label = fieldSpec.valueForKey("label");
                view = fieldSpec.valueForKey("view");
                if (fieldSpec.containsKey("extraSpacing")){
                    extraSpacing = fieldSpec.valueForKey("extraSpacing", JSInsets);
                }else{
                    extraSpacing = JSInsets.Zero;
                }
                this.addField(label, view, extraSpacing);
            }
        }
        if (spec.containsKey("fieldSpacing")){
            this.fieldSpacing = spec.valueForKey("fieldSpacing");
        }
        if (spec.containsKey("labelSpacing")){
            this.labelSpacing = spec.valueForKey("labelSpacing");
        }
    },

    addField: function(label, view, extraSpacing){
        if (label !== null){
            this.addSubview(label);
        }
        this.addSubview(view);
        var separator = null;
        if (this.separatorColor !== null){
            separator = UIView.init();
            separator.backgroundColor = this.separatorColor;
            this.addSubview(separator);
        }
        this.fields.push({label: label, view: view, extraSpacing: extraSpacing, separatorView: separator});
    },

    getIntrinsicSize: function(){
        var size = JSSize(UIView.noIntrinsicSize, (this.fields.length - 1) * this.labelSpacing);
        if (this.separatorColor !== null){
            size.height += this.fields.length;
        }
        var field;
        for (var i = 0, l = this.fields.length; i < l; ++i){
            field = this.fields[i];
            size.height += field.view.intrinsicSize.height + field.extraSpacing.height;
        }
        if (this.fields.length > 0){
            size.height -= this.fields[0].extraSpacing.top;
            size.height -= this.fields[this.fields.length - 1].extraSpacing.bottom;
        }
        return size;
    },

    layoutSubviews: function(){
        var i ,l;
        var field;
        var labelWidth = 0;
        for (i = 0, l = this.fields.length; i < l; ++i){
            field = this.fields[i];
            if (field.label !== null){
                field.label.sizeToFitSize(JSSize(this.maximumLabelSize, Number.MAX_VALUE));
                if (field.label.bounds.size.width > labelWidth){
                    labelWidth = field.label.bounds.size.width;
                }
            }
        }
        var labelX = 0;
        var fieldX = labelWidth + this.labelSpacing;
        var fieldWidth = this.bounds.size.width - fieldX;
        var y = 0;
        for (i = 0, l = this.fields.length; i < l; ++i){
            field = this.fields[i];
            y += field.extraSpacing.top;
            field.view.frame = JSRect(fieldX, y, field.view.intrinsicSize.width == UIView.noIntrinsicSize ? fieldWidth : field.view.intrinsicSize.width, field.view.intrinsicSize.height);
            if (field.label !== null){
                field.label.frame = JSRect(labelX, y + field.view.firstBaselineOffsetFromTop - field.label.firstBaselineOffsetFromTop, labelWidth, field.label.bounds.size.height);
            }
            y += field.view.bounds.size.height + this.fieldSpacing;
            y += field.extraSpacing.bottom;
            if (field.separatorView !== null){
                field.separatorView.frame = JSRect(0, y, this.bounds.size.width, 1);
                y += 1;
            }
        }
    }

});