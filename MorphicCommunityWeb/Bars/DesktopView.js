// #import UIKit
'use strict';

JSClass("DesktopView", UIView, {

    taskbar: null,
    taskbarHeight: 40,
    backgroundImageView: null,
    icons: null,

    init: function(){
        DesktopView.$super.init.call(this);
        this.backgroundColor = JSColor.initWithRGBA(0, 169/255.0, 246/255.0);
        var backgroundImage = JSImage.initWithResourceName("WindowsDesktop.jpg");
        this.icons = [
            DesktopIconView.initWithImage(JSImage.initWithResourceName("WindowsRecycleBin"), "Recycle Bin")
        ];
        this.backgroundImageView = UIImageView.initWithImage(backgroundImage);
        this.backgroundImageView.scaleMode = UIImageView.ScaleMode.aspectFill;
        this.taskbar = DesktopTaskbarView.init();
        this.addSubview(this.backgroundImageView);
        for (var i = 0, l = this.icons.length; i < l; ++i){
            this.addSubview(this.icons[i]);
        }
        this.addSubview(this.taskbar);
        this.setNeedsLayout();
    },

    layoutSubviews: function(){
        this.backgroundImageView.frame = this.bounds;
        this.taskbar.frame = JSRect(0, this.bounds.size.height - this.taskbarHeight, this.bounds.size.width, this.taskbarHeight);
        var iconSize = JSSize(96, 62);
        var origin = JSPoint(0, 10);
        var icon;
        for (var i = 0, l = this.icons.length; i < l; ++i){
            icon = this.icons[i];
            icon.frame = JSRect(origin, iconSize);
            origin.y += iconSize.height;
            if (origin.y + iconSize.height > this.bounds.size.height - this.taskbarHeight - 10){
                origin.y = 10;
                origin.x += iconSize.width;
            }
        }
    }

});

JSClass("DesktopTaskbarView", UIView, {

    startMenuButton: null,
    searchView: null,

    init: function(){
        DesktopTaskbarView.$super.init.call(this);
        var startMenuIcon = JSImage.initWithResourceName("StartMenuIcon").imageWithRenderMode(JSImage.RenderMode.template);
        this.startMenuButton = UIImageView.initWithImage(startMenuIcon);
        this.startMenuButton.templateColor = JSColor.black;
        this.startMenuButton.scaleMode = UIImageView.ScaleMode.center;
        this.searchView = UIView.init();
        this.searchView.borderWidth = 1;
        this.searchView.borderColor = JSColor.initWithWhite(0.8);
        this.searchView.backgroundColor = JSColor.white;
        this.backgroundColor = JSColor.initWithRGBA(209/255.0, 232/255.0, 241/255.0);
        this.addSubview(this.startMenuButton);
        this.addSubview(this.searchView);
        this.setNeedsLayout();
    },

    layoutSubviews: function(){
        this.startMenuButton.frame = JSRect(0, 0, 48, this.bounds.size.height);
        this.searchView.frame = JSRect(this.startMenuButton.frame.size.width, 0, 300, this.bounds.size.height);
    }

});

JSClass("DesktopIconView", UIView, {

    imageView: null,
    label: null,

    initWithImage: function(image, label){
        DesktopIconView.$super.init.call(this);
        this.imageView = UIImageView.initWithImage(image);
        this.label = UILabel.init();
        this.label.font = JSFont.systemFontOfSize(12);
        this.label.textColor = JSColor.white;
        this.label.textAlignment = JSTextAlignment.center;
        this.label.attributedText = JSAttributedString.initWithString(label, {});
        this.addSubview(this.imageView);
        this.addSubview(this.label);
    },

    layoutSubviews: function(){
        var labelHeight = this.label.intrinsicSize.height;
        var iconSize = this.bounds.size.height - labelHeight;
        this.imageView.frame = JSRect((this.bounds.size.width - iconSize) / 2, 0, iconSize, iconSize);
        this.label.frame = JSRect(0, iconSize, this.bounds.size.width, labelHeight);
    }

});