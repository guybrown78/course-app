define([
    'js/data/models/BaseModel'
    
], function(BaseModel) {

    /**
     * @class TitleValueModel contains a key/value pair with the properties title and value
     */
    var TitleValueModel = BaseModel.extend({
        type:"TitleValue",
        defaults:{
            title:"",
            value:null
        }

    });
    return TitleValueModel;
});

