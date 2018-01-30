define([
    'js/data/collections/BaseCollection',
    'js/data/models/TitleValueModel'
], function(BaseCollection, TitleValueModel) {
    var TitleValueCollection = BaseCollection.extend({
        type:'TitleValue',
        model: TitleValueModel
    });
    return TitleValueCollection;
});
