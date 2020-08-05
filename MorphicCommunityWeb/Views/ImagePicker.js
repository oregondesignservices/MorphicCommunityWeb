// #import UIKit
'use strict';

JSClass("ImagePicker", UIControl, {

    initWithFrame: function(frame){
        ImagePicker.$super.initWithFrame.call(this, frame);
        this._images = [];
        this._cells = [];
        this.noImage = JSImage.initWithResourceName("NoImage");
        this.backgroundColor = JSColor.white;
        this.contentInsets = JSInsets(5);
        this.borderWidth = 1;
        this.borderColor = JSColor.initWithWhite(0.4);
        this.selectionIndicator = UIView.init();
        this.selectionIndicator.backgroundColor = JSColor.initWithRGBA(0, 128/255.0, 255/255.0, 0.3);
        this.selectionIndicator.cornerRadius = 2;
        this.addSubview(this.selectionIndicator);
        this.startMouseTracking(UIView.MouseTracking.all);
    },

    selectedImage: JSDynamicProperty("_selectedImage", null),
    noImage: null,
    images: JSDynamicProperty("_images", null),
    imagesPerRow: JSDynamicProperty("_imagesPerRow", 6),
    imageSpacing: JSDynamicProperty("_imageSpacing", 2),
    templateColor: JSDynamicProperty("_templateColor", JSColor.black),
    contentInsets: JSDynamicProperty("_contentInsets", JSInsets.Zero),
    selectionIndicator: null,
    activeIndicator: null,
    overIndicator: null,
    _cells: null,
    _imageSize: 0,

    setSelectedImage: function(selectedImage){
        this._selectedImage = selectedImage;
        this.setNeedsLayout();
    },

    setImages: function(images){
        this._images = images;
        this.updateCells();
    },

    setTemplateColor: function(templateColor){
        this._templateColor = templateColor;
        for (var i = 0, l = this._cells.length; i < l; ++i){
            this._cells.imageView.templateColor = templateColor;
        }
    },

    updateCells: function(){
        var image;
        var cell;
        for (var i = 0, l = this._images.length; i < l; ++i){
            image = this._images[i];
            if (i < this._cells.length){
                cell = this._cells[i];
            }else{
                cell = ImagePickerCell.init();
                cell.imageView.templateColor = this._templateColor;
                this._cells.push(cell);
                this.addSubview(cell);
            }
            cell.imageView.image = image || this.noImage;
        }
        for (var j = this._cells.length - 1; j >= i; --j){
            this._cells[j].removeFromSuperview();
            this._cells.splice(j, 1);
        }
    },

    sizeThatFitsSize: function(maxSize){
        var width = maxSize.width;
        var imageSize = (width - this._contentInsets.width - (this.imagesPerRow - 1) * this.imageSpacing) / this.imagesPerRow;
        var cellCount = this.images.length;
        var rows = Math.ceil(cellCount / this.imagesPerRow);
        return JSSize(width, this._contentInsets.height + rows * (imageSize + this.imageSpacing) - this.imageSpacing);
    },

    hitTest: function(location){
        if (this.bounds.containsPoint(location)){
            return this;
        }
        return null;
    },

    imageIndexAtLocation: function(location){
        var rowSize = this._imageSize + this.imageSpacing / 2;
        var colSize = rowSize;
        var row = Math.floor((location.y - this._contentInsets.top) / rowSize);
        var col = Math.floor((location.x - this._contentInsets.left) / colSize);
        var i = row * this.imagesPerRow + col;
        if (i < this.images.length){
            return i;
        }
        return -1;
    },

    mouseEntered: function(event){
        var location = event.locationInView(this);
        this.overIndicator = UIView.init();
        this.overIndicator.backgroundColor = JSColor.white.colorWithAlpha(0.3);
        this.addSubview(this.overIndicator);
        this.updateOverIndicator(location);
    },

    mouseExited: function(event){
        if (this.overIndicator !== null){
            this.overIndicator.removeFromSuperview();
            this.overIndicator = null;
        }
    },

    mouseMoved: function(event){
        if (this.overIndicator !== null){
            var location = event.locationInView(this);
            this.updateOverIndicator(location);
        }
    },

    updateOverIndicator: function(location){
        var index = this.imageIndexAtLocation(location);
        if (index < 0){
            this.overIndicator.hidden = true;
        }else{
            this.overIndicator.hidden = this._images[index] === this._selectedImage;
            this.overIndicator.frame = this._cells[index].frame;
        }
    },

    mouseDown: function(event){
        var location = event.locationInView(this);
        this.active = true;
        var index = this.imageIndexAtLocation(location);
        this.activeIndicator = UIView.init();
        this.activeIndicator.backgroundColor = JSColor.black.colorWithAlpha(0.2);
        this.activeIndicator.cornerRadius = 2;
        this.overIndicator.hidden = true;
        this.addSubview(this.activeIndicator);
        this.updateActiveIndicator(location);
    },

    mouseDragged: function(event){
        var location = event.locationInView(this);
        this.active = this.bounds.containsPoint(location);
        this.updateActiveIndicator(location);
    },

    mouseUp: function(event){
        var location = event.locationInView(this);
        if (this.active){
            var index = this.imageIndexAtLocation(location);
            if (index >= 0){
                this.selectedImage = this.images[index];
                this.didChangeValueForBinding("selectedImage");
                this.sendActionsForEvents(UIControl.Event.primaryAction | UIControl.Event.valueChanged, event);
            }
            this.active = false;
            this.activeIndicator.removeFromSuperview();
            this.activeIndicator = null;
            if (this.overIndicator !== null){
                this.overIndicator.hidden = false;
                this.updateOverIndicator(location);
            }
        }
    },

    updateActiveIndicator: function(location){
        var index = this.imageIndexAtLocation(location);
        if (index < 0){
            this.activeIndicator.hidden = true;
        }else{
            this.activeIndicator.hidden = this._images[index] === this._selectedImage;
            this.activeIndicator.frame = this._cells[index].frame.rectWithInsets(-this._imageSpacing / 2);
        }
    },

    layoutSubviews: function(){
        var origin = JSPoint(this._contentInsets.left, this._contentInsets.top);
        this._imageSize = (this.bounds.size.width - this._contentInsets.width - (this._imagesPerRow - 1) * this._imageSpacing) / this._imagesPerRow;
        var cell;
        var image;
        var size = JSSize(this._imageSize, this._imageSize);
        this.selectionIndicator.hidden = true;
        for (var i = 0, l = this._cells.length; i < l; ++i){
            cell = this._cells[i];
            cell.frame = JSRect(origin, size);
            image = this._images[i];
            if (image === this._selectedImage){
                this.selectionIndicator.hidden = false;
                this.selectionIndicator.frame = cell.frame.rectWithInsets(-this._imageSpacing / 2);
            }
            origin.x += this._imageSize + this._imageSpacing;
            if ((i + 1) % this._imagesPerRow === 0){
                origin.x = this._contentInsets.left;
                origin.y += this._imageSize + this._imageSpacing;
            }
        }
    },

});

JSClass("ImagePickerCell", UIView, {

    imageView: null,

    initWithFrame: function(frame){
        ImagePickerCell.$super.initWithFrame.call(this, frame);
        // this.backgroundColor = JSColor.white;
        this.imageView = UIImageView.init();
        this.imageView.scaleMode = UIImageView.ScaleMode.aspectFill;
        this.imageView.contentInsets = JSInsets(5);
        this.addSubview(this.imageView);
    },

    layoutSubviews: function(){
        this.imageView.frame = this.bounds;
    }

});