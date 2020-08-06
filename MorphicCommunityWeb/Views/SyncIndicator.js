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

(function(){

JSClass("SyncIndicator", UIControl, {

    initWithFrame: function(frame){
        SyncIndicator.$super.initWithFrame.call(this, frame);
        this._commonSyncIndicatorInit();
    },

    initWithSpec: function(spec){
        SyncIndicator.$super.initWithSpec.call(this, spec);
        if (spec.containsKey("errorTooltip")){
            this.errorTooltip = spec.valueForKey("errorTooltip");
        }
        this._commonSyncIndicatorInit();
    },

    _commonSyncIndicatorInit: function(){
        this.imageView = UIImageView.init();
        this.imageView.scaleMode = UIImageView.ScaleMode.aspectFit;
        this.hidden = true;
        this.addSubview(this.imageView);
    },

    imageView: null,
    state: JSDynamicProperty("_state", JSSynchronizer.State.idle),

    setState: function(state){
        this._state = state;
        this.hidden = state === JSSynchronizer.State.idle;
        this.imageView.image = images.forState(state);
        if (state === JSSynchronizer.State.error){
            this.tooltip = this.errorTooltip;
        }else{
            this.tooltip = null;
        }
    },

    getIntrinsicSize: function(){
        return JSSize(11, 11);
    },

    layoutSubviews: function(){
        this.imageView.frame = this.bounds;
    },

    mouseDown: function(event){
        if (this.state === JSSynchronizer.State.error){
            this.active = true;
        }else{
            SyncIndicator.$super.mouseDown.call(this);
        }
    },

    mouseDragged: function(event){
        var location = event.locationInView(this);
        this.active = this.bounds.containsPoint(location);
    },

    mouseUp: function(event){
        if (this.active){
            this.sendActionsForEvents(UIControl.Event.primaryAction, event);
            this.active = false;
        }
    },

    update: function(){
        if (this.active){
            this.imageView.alpha = 0.4;
        }else{
            this.imageView.alpha = 1;
        }
    },

    errorTooltip: null,

});

var images = JSImage.resourceCache([
    'SyncPending',
    'SyncWorking',
    'SyncSuccess',
    'SyncError'
]);

images.forState = function(state){
    switch (state){
        case JSSynchronizer.State.pending:
            return images.SyncPending;
        case JSSynchronizer.State.working:
            return images.SyncWorking;
        case JSSynchronizer.State.success:
            return images.SyncSuccess;
        case JSSynchronizer.State.error:
            return images.SyncError;
        default:
            return null;
    }
};

})();