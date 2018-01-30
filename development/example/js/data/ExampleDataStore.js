define([
    'js/data/dataStore',
    'js/data/models/tree/BaseTreeModel'

], function(dataStore, treeModel) {

    var ExampleDataStore = dataStore.extend({
        
        defaults:{
           tree:null
        },
        
        initialize: function() {
            dataStore.prototype.initialize.apply(this);
            this.set('tree', new treeModel());
        }
    });
    return new ExampleDataStore();
});
