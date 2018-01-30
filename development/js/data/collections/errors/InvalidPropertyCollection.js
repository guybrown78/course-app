define([
    'js/data/collections/BaseCollection',
    'js/data/models/errors/InvalidPropertyModel'
], function(BaseCollection, InvalidPropertyModel) {
    var InvalidPropertyCollection = BaseCollection.extend({
        type:'InvalidProperty',
        model: InvalidPropertyModel
    });
    return InvalidPropertyCollection;
});
