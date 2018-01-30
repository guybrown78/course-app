define([
    'underscore',
    'backbone',
], function(_, Backbone) {
    var BaseCollection = Backbone.Collection.extend({
        
        isGlobal:true,
        loadParams:null,
        
        initialize: function() {
            this.on('reset', this.callModelInitialisers)
            this.on('add', this.callModelInitialisers)
        },
        
        callModelInitialisers: function(args) {
            _.each(this.models, function(model) {
                if (model.init) {
                    model.init(args)
                }
            })
        },
        
        /**
         * This is set to be overridden by any collections that need to use another method than fetch
         */
        load:function(loadOptions, data)
        {
            loadOptions.reset = true;
            if(data)
            {
                this.loadParams = data;
            }
            this.fetch(loadOptions)
        },
        
        /**
         * Overides Backbone method to add 'success' event
         *
         * @param {Object } options
         */
        fetch: function(loadOptions) {
            loadOptions || (loadOptions = {
            });
            var success = loadOptions.success;
            var collection = this;
        //    loadOptions.headers.dataType = "json";
            // success doesn't have an event so always trigger
            loadOptions.success = function(resp, status, xhr) {
                collection.trigger('success', collection, resp, xhr);
                if (success) {
                    success(collection, resp, xhr);
                }
            };
            loadOptions.global = this.isGlobal;
            Backbone.Collection.prototype.fetch.call(this, loadOptions);
        },
        
        update:function(loadOptions, data)
        {
            loadOptions || (loadOptions = {});
            var success = loadOptions.success;
            var collection = this;
            // success doesn't have an event so always trigger
            loadOptions.success = function(resp, status, xhr) {
                collection.trigger('saveSuccess', collection, resp, xhr);
                if (success) {
                    success(collection, resp, xhr);
                }
            };
            loadOptions.data = JSON.stringify(data);
            Backbone.sync("update", this, loadOptions)
        },
                
        getIsAlreadyLoaded:function()
        {
            return false;
        }
    });
    return BaseCollection;
});
