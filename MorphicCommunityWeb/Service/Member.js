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