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