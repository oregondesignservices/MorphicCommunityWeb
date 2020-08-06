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
// #import "BarItemLibrary.js"
// #import "Bar.js"
'use strict';

JSClass("BarItemLibraryViewController", UIViewController, {

    items: null,

    // MARK: - View Lifecycle

    viewDidLoad: function(){
        BarItemLibraryViewController.$super.viewDidLoad.call(this);
        this.items = BarItemLibrary.shared.items;
        this.listView.reloadData();
    },

    viewWillAppear: function(animated){
        BarItemLibraryViewController.$super.viewWillAppear.call(this, animated);
    },

    viewDidAppear: function(animated){
        BarItemLibraryViewController.$super.viewDidAppear.call(this, animated);
    },

    viewWillDisappear: function(animated){
        BarItemLibraryViewController.$super.viewWillDisappear.call(this, animated);
    },

    viewDidDisappear: function(animated){
        BarItemLibraryViewController.$super.viewDidDisappear.call(this, animated);
    },

    // MARK: - List View Data Source

    listView: JSOutlet(),

    numberOfSectionsInListView: function(listView){
        return 1;
    },

    numberOfRowsInListViewSection: function(listView, sectionIndex){
        return this.items.length;
    },

    cellForListViewAtIndexPath: function(listView, indexPath){
        var cell = listView.dequeueReusableCellWithIdentifier("item", indexPath);
        var item = this.items[indexPath.row];
        cell.titleLabel.text = item.title;
        cell.detailLabel.text = item.description;
        cell.detailLabel.maximumNumberOfLines = 2;
        cell.imageView.image = JSImage.initWithResourceName(item.icon);
        cell.titleInsets.left = 24;
        cell.titleInsets.right = 24;
        return cell;
    },

    listViewDidSelectCellAtIndexPath: function(listView, indexPath){
        listView.selectedIndexPath = null;
    },

    listViewDidOpenCellAtIndexPath: function(listView, indexPath){
        // TODO: add item, but where does message go?
    },

    listViewShouldDragCellAtIndexPath: function(listView, indexPath){
        return true;
    },

    _dragImage: null,

    pasteboardItemsForListViewAtIndexPath: function(listView, indexPath){
        var libraryItem = this.items[indexPath.row];
        var item = BarItem.initWithKind(libraryItem.kind);
        item.configuration = BarItemConfiguration.initWithKind(item.kind, libraryItem.configuration);
        this._dragImage = JSImage.initWithResourceName(libraryItem.icon);
        return [
            {objectValue: item.dictionaryRepresentation(), type: "x-morphic-community/bar-item"}
        ];
    },

    listViewWillBeginDraggingSession: function(listView, session){
        var image = this._dragImage;
        this._dragImage = null;
        session.setImage(image, JSPoint(image.size.width - 4, image.size.height - 4));
        session.allowedOperations = UIDragOperation.copy;
    },

    // MARK: - Layout

    viewDidLayoutSubviews: function(){
        this.listView.frame = this.view.bounds;
    }

});