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
        item.configuration = JSDeepCopy(libraryItem.configuration);
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