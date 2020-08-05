// #import UIKit
// #import "Bar.js"
// #import "BarItemDetailView.js"
// #import "BarItemLinkDetailView.js"
// #import "BarItemApplicationDetailView.js"
// #import "BarItemActionDetailView.js"
'use strict';

(function(){

JSProtocol("BarItemDetailViewController", JSProtocol, {

    barItemDetailViewDidAffectBarLayout: function(viewController){},
    barItemDetailViewDidFinishEditing: function(viewController, withChanges){},
    barItemDetailViewDidRemoveItem: function(viewController){}

});

JSClass("BarItemDetailViewController", UIViewController, {

    item: null,

    delegate: null,

    defaultButtonColor: JSColor.initWithRGBA(0, 41/255.0, 87/255.0),
    defaultActionColor: JSColor.initWithRGBA(0, 129/255.0, 69/255.0),

    buttonColorShortcuts: [
        JSColor.initWithRGBA(0, 41/255.0, 87/255.0),
        JSColor.initWithRGBA(0, 129/255.0, 69/255.0),
        JSColor.initWithRGBA(129/255.0, 43/255.0, 0),
        JSColor.initWithRGBA(217/255.0, 106/255.0, 49/255.0),
        JSColor.initWithRGBA(33/255.0, 174/255.0, 154/255.0),
        JSColor.initWithRGBA(101/255.0, 54/255.0, 171/255.0),
        JSColor.initWithRGBA(197/255.0, 36/255.0, 98/255.0),
        JSColor.initWithRGBA(0/255.0, 0/255.0, 0/255.0),
    ],

    defaultImageURLs: [
        JSURL.initWithString("link-solid"),
        JSURL.initWithString("envelope-solid"),
        JSURL.initWithString("calendar-solid"),
        JSURL.initWithString("video-solid"),
        JSURL.initWithString("camera-solid"),
        JSURL.initWithString("comment-solid"),
        JSURL.initWithString("images-solid"),
        JSURL.initWithString("music-solid"),
        JSURL.initWithString("newspaper-solid"),
        JSURL.initWithString("question-solid"),
        JSURL.initWithString("shopping-cart-solid"),
        JSURL.initWithString("google-brands"),
        JSURL.initWithString("google-drive-brands"),
        JSURL.initWithString("amazon-brands"),
        JSURL.initWithString("skype-brands"),
    ],
    images: null,
    imageURLsByObjectId: null,
    imagesByURL: null,

    changed: false,

    // MARK: - View Lifecycle

    loadView: function(){
        this.view = this.createViewForItem();
    },

    createViewForItem: function(){
        if (this.item !== null){
            if (this.item.kind == BarItem.Kind.link){
                return BarItemLinkDetailView.init();
            }
            if (this.item.kind == BarItem.Kind.application){
                return BarItemApplicationDetailView.init();
            }
            if (this.item.kind == BarItem.Kind.action){
                return BarItemActionDetailView.init();
            }
        }
        return BarItemDetailView.init();
    },

    imageForURL: function(url){
        if (url === null){
            return null;
        }
        var image = this.imagesByURL[url.encodedString];
        if (!image){
            if (url.isAbsolute){
                image = JSImage.initWithURL(url, JSSize(32, 32));
            }else{
                image = bundledImages[url.path];
            }
            this.imagesByURL[url.encodedString] = image;
            this.imageURLsByObjectId[image.objectID] = url;
        }
        return image;
    },

    urlForImage: function(image){
        if (image === null){
            return null;
        }
        return this.imageURLsByObjectId[image.objectID];
    },

    viewDidLoad: function(){
        BarItemDetailViewController.$super.viewDidLoad.call(this);

        // Setup the images for the image picker
        this.images = [
            null
        ];
        this.imagesByURL = {};
        this.imageURLsByObjectId = {};
        var url;
        var image;
        for (var i = 0, l = this.defaultImageURLs.length; i < l; ++i){
            url = this.defaultImageURLs[i];
            this.images.push(this.imageForURL(url));
        }
        var controller = this;
        var imageValueTransformer = {
            transformValue: function(url){
                return controller.imageForURL(url);
            },

            reverseTransformValue: function(image){
                return controller.urlForImage(image);
            }
        };

        // Every view has remove button
        this.view.removeButton.addAction(this.removeItem, this);

        // Setup specific types of views 
        if (this.view instanceof BarItemLinkDetailView){
            this.view.labelField.delegate = this;
            this.view.urlField.delegate = this;
            this.view.labelField.bind("text", this, "item.configuration.label");
            this.view.urlField.bind("text", this, "item.configuration.url", {valueTransformer: {
                transformValue: function(url){
                    if (url === null){
                        return null;
                    }
                    return url.encodedString;
                },

                reverseTransformValue: function(string){
                    return JSURL.initWithString(string);
                }
            }});
            this.view.colorBar.shortcutColors = this.buttonColorShortcuts;
            this.view.colorBar.bind("color", this, "item.configuration.color", {nullPlaceholder: this.defaultButtonColor});
            this.view.colorBar.addAction(this.colorChanged, this);
            this.view.imagePicker.images = this.images;
            this.view.imagePicker.bind("selectedImage", this, "item.configuration.imageURL", {valueTransformer: imageValueTransformer});
            this.view.imagePicker.addAction(this.imageChanged, this);
        }else if (this.view instanceof BarItemApplicationDetailView){
            this.view.labelField.delegate = this;
            this.view.labelField.bind("text", this, "item.configuration.label");
            this.view.colorBar.shortcutColors = this.buttonColorShortcuts;
            this.view.colorBar.bind("color", this, "item.configuration.color", {nullPlaceholder: this.defaultButtonColor});
            this.view.colorBar.addAction(this.colorChanged, this);
            this.view.imagePicker.images = this.images;
            this.view.imagePicker.bind("selectedImage", this, "item.configuration.imageURL", {valueTransformer: imageValueTransformer});
            this.view.imagePicker.addAction(this.imageChanged, this);
        }else if (this.view instanceof BarItemActionDetailView){
            this.view.colorBar.shortcutColors = this.buttonColorShortcuts;
            this.view.colorBar.bind("color", this, "item.configuration.color", {nullPlaceholder: this.defaultActionColor});
            this.view.colorBar.addAction(this.colorChanged, this);
        }
    },

    viewWillAppear: function(animated){
        BarItemDetailViewController.$super.viewWillAppear.call(this, animated);
    },

    viewDidAppear: function(animated){
        BarItemDetailViewController.$super.viewDidAppear.call(this, animated);
        this.view.window.firstResponder = this.view.initialFirstResponder;
    },

    viewWillDisappear: function(animated){
        BarItemDetailViewController.$super.viewWillDisappear.call(this, animated);
    },

    viewDidDisappear: function(animated){
        BarItemDetailViewController.$super.viewDidDisappear.call(this, animated);
        if (this.delegate && this.delegate.barItemDetailViewDidFinishEditing){
            this.delegate.barItemDetailViewDidFinishEditing(this, this.changed);
        }
    },

    contentSizeThatFitsSize: function(maxSize){
        var size = JSSize.Zero;
        var intrinsicSize = this.view.intrinsicSize;
        size.height = intrinsicSize.height;
        size.width = intrinsicSize.width;
        if (size.width === UIView.noIntrinsicSize){
            size.width = 220;
        }
        if (size.width > maxSize.width){
            size.width = maxSize.width;
        }
        return size;
    },

    popupWindow: null,

    popupAdjacentToView: function(view, placement){
        this.popupWindow = BarItemDetailPopupWindow.init();
        this.popupWindow.contentViewController = this;
        view.window.modal = this.popupWindow;
        this.popupWindow.openAdjacentToView(view, placement);
    },

    dismiss: function(){
        if (this.popupWindow !== null){
            this.popupWindow.close();
            this.popupWindow = null;
        }
    },

    removeItem: function(){
        if (this.delegate && this.delegate.barItemDetailViewDidRemoveItem){
            this.delegate.barItemDetailViewDidRemoveItem(this);
        }
    },

    textFieldDidReceiveEnter: function(textField){
        this.dismiss();
    },

    textFieldDidChange: function(textField){
        this.changed = true;
        if (textField === this.view.labelField){
            if (this.delegate && this.delegate.barItemDetailViewDidAffectBarLayout){
                this.delegate.barItemDetailViewDidAffectBarLayout(this);
            }
        }
    },

    colorChanged: function(){
        this.changed = true;
    },

    imageChanged: function(){
        this.changed = true;
        if (this.delegate && this.delegate.barItemDetailViewDidAffectBarLayout){
            this.delegate.barItemDetailViewDidAffectBarLayout(this);
        }
    },

});

JSClass("BarItemDetailPopupWindow", UIPopupWindow, {

    escapeClosesWindow: true,

    indicateModalStatus: function(){
        this.contentViewController.dismiss();
    },

    keyDown: function(event){
        if (this.escapeClosesWindow && event.key == UIEvent.Key.escape){
            this.contentViewController.dismiss();
        }else{
            BarItemDetailPopupWindow.$super.keyDown.call(this, event);
        }
    },

});

var imageCache = function(names, bundle){
    var cache = {};
    var definePropertyFromName = function(name){
        Object.defineProperty(cache, name, {
            configurable: true,
            get: function(){
                var img = JSImage.initWithResourceName(name, bundle).imageWithRenderMode(JSImage.RenderMode.template);
                Object.defineProperty(this, name, {value: img});
                return img;
            }
        });
    };
    for (var i = 0, l = names.length; i < l; ++i){
        definePropertyFromName(names[i]);
    }
    return cache;
};

var bundledImages = imageCache([
    "amazon-brands",
    "calendar-solid",
    "camera-solid",
    "comment-solid",
    "envelope-solid",
    "google-brands",
    "google-drive-brands",
    "images-solid",
    "link-solid",
    "music-solid",
    "newspaper-solid",
    "question-solid",
    "shopping-cart-solid",
    "skype-brands",
    "video-solid"
]);

})();