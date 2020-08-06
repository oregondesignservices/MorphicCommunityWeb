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
// #import "BarItemDetailViewController.js"
'use strict';

(function(){

JSClass("BarItemButtonDetailViewController", BarItemDetailViewController, {

    labelField: JSOutlet(),
    colorBar: JSOutlet(),
    imagePicker: JSOutlet(),

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
        BarItemButtonDetailViewController.$super.viewDidLoad.call(this);
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
        this.imagePicker.images = this.images;
        this.imagePicker.bind("selectedImage", this, "item.configuration.imageURL", {valueTransformer: imageValueTransformer});
    },

    viewWillAppear: function(animated){
        BarItemButtonDetailViewController.$super.viewWillAppear.call(this, animated);
    },

    viewDidAppear: function(animated){
        BarItemButtonDetailViewController.$super.viewDidAppear.call(this, animated);
    },

    viewWillDisappear: function(animated){
        BarItemButtonDetailViewController.$super.viewWillDisappear.call(this, animated);
    },

    viewDidDisappear: function(animated){
        BarItemButtonDetailViewController.$super.viewDidDisappear.call(this, animated);
    },

    textFieldDidReceiveEnter: function(textField){
        this.dismiss();
    },

    textFieldDidChange: function(textField){
        this.changed = true;
        if (textField === this.labelField){
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