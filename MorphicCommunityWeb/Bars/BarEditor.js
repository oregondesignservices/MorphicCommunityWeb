// #import UIKit
'use strict';

JSProtocol("BarEditorDelegate", JSProtocol, {

    barEditorDidInsertItemAtIndex: function(barEditor, index){},
    barEditorDidRemoveItemAtIndex: function(barEditor, index){},
    barEditorDidChangeItemAtIndex: function(barEditor, index){}

});

JSClass("BarEditor", UIView, {

    initWithSpec: function(spec){
        BarEditor.$super.initWithSpec.call(this, spec);
        if (spec.containsKey("delegate")){
            this.delegate = spec.valueForKey("delegate");
        }
        this.desktopView = UIView.init();
        this.barView = UIView.init();
        this.barItemViews = [];

        this.addSubview(this.desktopView);
        this.addSubview(this.barView);
        this.backgroundColor = JSColor.white;
        this.borderColor = JSColor.black;
        this.borderWidth = 2;
    },

    desktopView: null,
    barView: null,
    barItemViews: null,

});