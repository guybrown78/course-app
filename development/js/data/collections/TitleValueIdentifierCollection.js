define([
    'js/data/collections/BaseCollection',
    'js/data/models/TitleValueIdentifierModel'
], function(BaseCollection, TitleValueIdentifierModel) {
    var TitleValueIdentifierCollection = BaseCollection.extend({
        type:'TitleValueIdentifier',
        model: TitleValueIdentifierModel
    });
    return TitleValueIdentifierCollection;
});
