define([
    'js/data/models/BaseModel'
    
], function(BaseModel) {

    /**
     * @class TitleValueIdentifierModel contains a title and optional identifier and order properties
     */
    var TitleValueIdentifierModel = BaseModel.extend({
        type:"TitleValueIdentifier",
        defaults:{
            propertyIdentifier:"",
            displayTitle:"",
            value:null,
            ordinal:null
        }

    });
    return TitleValueIdentifierModel;
});

