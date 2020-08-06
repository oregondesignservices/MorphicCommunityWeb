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
'use strict';

JSClass("Member", JSObject, {

    initWithDictionary: function(dictionary){
        this.id = dictionary.id;
        this.firstName = dictionary.first_name;
        this.lastName = dictionary.last_name;
        this.barId = dictionary.bar_id || null;
        this.role = dictionary.role || null;
        this.state = dictionary.state || null;
    },

    dictionaryRepresentation: function(){
        return {
            id: this.id,
            first_name: this.firstName,
            last_name: this.lastName,
            bar_id: this.barId,
            role: this.role,
            state: this.state
        };
    },

    id: null,
    firstName: null,
    lastName: null,
    placeholderName: "",
    barId: null,
    role: null,
    state: null,

    fullName: JSDynamicProperty(),

    getFullName: function(){
        if (this.firstName !== null && this.firstName !== "" && this.lastName !== null && this.lastName !== ""){
            return this.firstName + " " + this.lastName;
        }
        if (this.firstName !== null && this.firstName !== ""){
            return this.firstName;
        }
        if (this.lastName !== null && this.lastName !== ""){
            return this.lastName;
        }
        return this.placeholderName;
    }

});

Member.Role = {
    member: "member",
    manager: "manager"
};

Member.State = {
    uninvited: "uninvited",
    invited: "invited",
    active: "active"
};

Member.fullNameComparison = function(a, b){
    return a.fullName.localeCompare(b.fullName);
};