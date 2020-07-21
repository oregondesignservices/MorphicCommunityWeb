// #import UIKit
'use strict';

JSClass("FormView", UIView, {

    fields: null,
    fieldSpacing: 7,
    labelSpacing: 7,
    maximumLabelSize: Number.MAX_VALUE,

    initWithFrame: function(frame){
        FormView.$super.initWithFrame.call(this, frame);
        this.fields = [];
    },

    initWithSpec: function(spec){
        FormView.$super.initWithSpec.call(this, spec);
        this.fields = [];
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
    },

    addField: function(label, view, extraSpacing){
        if (label !== null){
            this.addSubview(label);
        }
        this.addSubview(view);
        this.fields.push({label: label, view: view, extraSpacing: extraSpacing});
    },

    getIntrinsicSize: function(){
        var size = JSSize(UIView.noIntrinsicSize, (this.fields.length - 1) * this.fieldSpacing);
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
                field.label.frame = JSRect(JSPoint(labelX, y + field.view.firstBaselineOffsetFromTop - field.label.firstBaselineOffsetFromTop), field.label.bounds.size);
            }
            y += field.view.bounds.size.height + this.fieldSpacing;
            y += field.extraSpacing.bottom;
        }
    }

});