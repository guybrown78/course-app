define([
    'js/data/models/BaseModel'
    
], function(BaseModel) {

    /**
     * @class InvalidPropertyModel contains attributes for multiple errors returned from a call
     */
    var InvalidPropertyModel = BaseModel.extend({
        type:"InvalidProperty",
        defaults:{
            domain:"",
            displayTitle:"",// ? not really sure why we need this
            reason:"",
            type:""
        }

    });
    return InvalidPropertyModel;
});

