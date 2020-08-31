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

JSClass("CommunityBillingAccountField", UIView, {

    initWithSpec: function(spec){
        CommunityBillingAccountField.$super.initWithSpec.call(this, spec);
        if (spec.containsKey("label")){
            this.label = spec.valueForKey("label");
            this.addSubview(this.label);
        }
        if (spec.containsKey("button")){
            this.button = spec.valueForKey("button");
            this.addSubview(this.button);
        }
    },

    label: null,
    button: null,

    getIntrinsicSize: function(){
        return JSSize(UIView.noIntrinsicSize, this.button.intrinsicSize.height);
    },

    layoutSubviews: function(){
        this.button.sizeToFit();
        this.label.sizeToFitSize(JSSize(this.bounds.size.width - this.button.bounds.size.width, Number.MAX_VALUE));
        this.button.frame = JSRect(JSPoint(this.label.bounds.size.width, 0), this.button.bounds.size);
        this.label.frame = JSRect(JSPoint(0, this.button.firstBaselineOffsetFromTop - this.label.firstBaselineOffsetFromTop), this.label.bounds.size);
    },

    getFirstBaselineOffsetFromTop: function(){
        return this.button.firstBaselineOffsetFromTop;
    }

});