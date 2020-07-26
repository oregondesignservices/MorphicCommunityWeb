// #import Foundation
'use strict';

JSClass("Invitation", JSObject, {

    memberId: null,
    toEmail: null,
    message: null,

    dictionaryRepresentation: function(){
        return {
            member_id: this.memberId,
            email: this.toEmail,
            message: this.message
        };
    }

});