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

// #import Foundation
// #import "BillingCard.js"
'use strict';

JSClass("Billing", JSObject, {

    initWithDictionary: function(dictionary){
        this.planId = dictionary.plan_id;
        this.contactMemberId = dictionary.contact_member_id;
        this.status = dictionary.status;
        this.trialEndDate = JSDate.initWithTimeIntervalSince1970(dictionary.trial_end);
        if (dictionary.card !== null && dictionary.card !== undefined){
            this.card = BillingCard.initWithDictionary(dictionary.card);
        }
    },

    dictionaryRepresentation: function(){
        return {
            plan_id: this.planId,
            contact_member_id: this.contactMemberId,
            status: this.status,
            trial_end: this.trialEndDate.timeIntervalSince1970,
            card: this.card !== null ? this.card.dictionaryRepresentation() : null
        };
    },

    planId: null,
    contactMemberId: null,
    status: null,
    trialEndDate: null,
    card: null

});

Billing.Status = {
    paid: "paid",
    pastDue: "past_due",
    canceled: "canceled"
};