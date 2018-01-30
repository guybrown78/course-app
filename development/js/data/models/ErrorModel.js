define([
    'js/data/models/BaseModel',
    'js/data/collections/errors/InvalidPropertyCollection'

], function(BaseModel, InvalidPropertyCollection) {

    var ErrorModel = BaseModel.extend({
        type:"Error",
        defaults: {
            /*errorId:0,
            errorType: "ajaxError",
            displayTitle:"An unknown error has occured", 
            displayMessage: "A data loading error has occurred please try again.",
            status: 0,
            statusText:"",
            //code:"",
            serviceId:"",
            errorAction:"generalError",
            errors:new InvalidPropertyCollection*/
            code:0,
            displayTitle:"An unknown error has occured", 
            displayMessage: "A data loading error has occurred please try again.",
            status: 0,
            statusText:"",
            serviceId:"",
            errorAction:"generalError",
            errors:new InvalidPropertyCollection
        },
        
        nestedModels:{
            errors:InvalidPropertyCollection
        }

    });
    return ErrorModel;
});
