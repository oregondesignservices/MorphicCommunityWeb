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

JSClass("AboutWindowController", UIWindowController, {

    iconView: JSOutlet(),
    titleLabel: JSOutlet(),
    versionLabel: JSOutlet(),
    copyrightLabel: JSOutlet(),
    creditLabel: JSOutlet(),
    sourceLabel: JSOutlet(),

    viewDidLoad: function(){
        AboutWindowController.$super.viewDidLoad.call(this);
        this.titleLabel.text = JSBundle.mainBundle.localizedStringForInfoKey("UIApplicationTitle");
        this.versionLabel.text = JSBundle.mainBundle.info.JSBundleVersion;
        this.copyrightLabel.text = JSBundle.mainBundle.localizedStringForInfoKey("JSCopyright");
        this.creditLabel.attributedText = this.attributedCredit();
        this.sourceLabel.attributedText = this.attributedSource();
    },

    attributedCredit: function(){
        var localizedCredit = JSBundle.mainBundle.localizedString("credit", "AboutWindowController");
        var attributedCredit = JSAttributedString.initWithString(localizedCredit);
        var url = JSURL.initWithString("https://jskit.dev");
        attributedCredit.replaceFormat("JSKit", {link: url, bold: true, cursor: UICursor.pointingHand});
        return attributedCredit;
    },

    attributedSource: function(){
        var localizedSource = JSBundle.mainBundle.localizedString("source", "AboutWindowController");
        var url = JSURL.initWithString("https://github.com/oregondesignservices/MorphicCommunityWeb/blob/master/CREDITS.md");
        var attributedSource = JSAttributedString.initWithString(localizedSource, {link: url, cursor: UICursor.pointingHand});
        return attributedSource;
    },

});