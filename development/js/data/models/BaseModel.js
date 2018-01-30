define([
    'backbone'

], function(Backbone) {

    /**
     * @class BaseResultModel data model defining methods common to all models
     */
    var BaseModel = Backbone.Model.extend({
        loadParams: null,
        isGlobal:true,
        isLoading:false,

        validation:{},
        validationRules:[],
        /**
         * Set up listeners
         *
         */
        initialize: function()
        {
            this.on('success', this.onLoadSuccess);
            this.on('saveSuccess', this.onSaveSuccess);
           // this.setValidationRules();
            // set backbone id
            this.id = this.get('id');
        },

        /**
         * This is set to be overridden by any models that need to use another method than fetch
         */
        load:function(loadOptions, data)
        {
            if(data)
            {
                this.loadParams = data;
            }
            this.fetch(loadOptions);
        },

        update:function(loadOptions, data)
        {
            loadOptions || (loadOptions = {});
            var success = loadOptions.success;
            var model = this;
            // success doesn't have an event so always trigger
            loadOptions.success = function(resp, status, xhr) {
                model.trigger('saveSuccess', model, resp, xhr);
                if (success) {
                    success(model, resp, xhr);
                }
            };
            if(model.type === 'login')
            {
                loadOptions.data = $.param(data);
            }
            else
            {
                loadOptions.data = JSON.stringify(data);
                loadOptions.dataType = "json";
                // The jsonp setting prevents issues with sending ? as text.
                // In addition contentType = "application/json; charset=UTF-8" could also be set in replace.
                // Please see https://github.com/jquery/jquery/issues/1799 OR
                //            https://github.com/jquery/api.jquery.com/issues/878
                loadOptions.jsonp = false;
            }
            loadOptions.global = this.isGlobal;
            Backbone.Model.prototype.save.call(this, data, loadOptions);
        },

        /**
         * Overides Backbone method to add 'success' event
         *
         * @param {Object } options
         */
        fetch: function(loadOptions, data) {
            loadOptions || (loadOptions = {
            });
            var success = loadOptions.success;
            var model = this;
        //    loadOptions.headers.dataType = "json";
            // success doesn't have an event so always trigger
            loadOptions.success = function(resp, status, xhr) {
                model.trigger('success', model, resp, xhr);
                if (success) {
                    success(model, resp, xhr);
                }
            };
            loadOptions.data = data;
            loadOptions.global = this.isGlobal;
            Backbone.Model.prototype.fetch.call(this, loadOptions);
        },

        /**
         * Overides Backbone method to add 'success' event
         *
         * @param {Object } options
         */
        destroy: function(loadOptions) {
            console.log("BASE MODEL");
            loadOptions || (loadOptions = {
            });
            var success = loadOptions.success;
            var model = this;
            // trigger specific destroy success event so views can listen to success
            loadOptions.success = function(resp, status, xhr) {
                model.trigger('deleteSuccess', model, resp, xhr);
                if (success) {
                    success(model, resp, xhr);
                }
            };
            loadOptions.global = this.isGlobal;
            Backbone.Model.prototype.destroy.call(this, loadOptions);
        },

        searchChildren:function(arr, child, property, attr, criteria)
        {
            var that = this;
            var match = null;
            match = _.filter(child.models, function(item)
            {
                if(item.get(attr) === criteria)
                {
                    arr.push(item);
                }
                if(item.get(property) && item.get(property).length > 0)
                {
                    that.searchChildren(arr, item.get(property), property, attr, criteria);
                }
            });
        },

        getChildMatch:function(collection, property, attr, criteria)
        {
            var newModels = [];
            this.searchChildren(newModels, collection, property, attr, criteria);
            if(newModels.length > 0)
            {
                return newModels[0];
            }
            return null;
        },

        /**
         * To be overridden if model has actions to perform on successful load
         *
         */
        onLoadSuccess: function() {
            //to be overridden
        },

        /**
         * To be overridden if model has actions to perform on successful save
         *
         */
        onSaveSuccess:function()
        {
            //to be overridden
        },

        /**
         * Set to be overridden by any models that may not need loaded (i.e. userModel, clientConfig)
         *
         */
        getIsAlreadyLoaded: function()
        {
            return false;
        },

        /**
         * Overrides Backbone method to enable parsing of complex nested data structures and allowing definition of Model / Collection types to be assigned to each
         * Requires 'models' property to be defined as object containing one or many 'key:Class' property (e.g. models: {Roles:RoleCollection})
         *
         * 'key' = data attribute name in json / model e.g. Status
         * 'class' = data model / collection classname e.g. StatusModel
         *
         * NOTE: Models MUST be created in 'defaults' declaration otherwise will not work when model is parsed as part of a collection e.g.
         *  defaults: {
                Status: new StatusModel
            }
         *
         * @param {response} JSON data
         * @returns {Object} object reflecting nested data structure
         */
        parse: function(response) {
            for (var key in this.nestedModels)
            {
                var nestedClass = this.nestedModels[key];
                var nestedData = response[key];
                //{parse:true} attr needed to ensure parse method is called on nested models that are not part of collections
                    response[key] = new nestedClass(nestedData, {
                        parse: true
                    });
                }
            return response;
        },

        /**
         * Overrides Backbone method to enable serialisation of complex nested data structures and allowing definition of Model / Collection types to be assigned to each
         * Requires 'models' property to be defined as object containing one or many 'key:Class' property (e.g. models: {Roles:RoleCollection})

         * 'key' = data attribute name in json / model e.g. Status
         * 'class' = data model / collection classname e.g. StatusModel
         *
         * NOTE: Models MUST be created in 'defaults' declaration otherwise will not work when model is parsed as part of a collection e.g.
         *  defaults: {
                Status: new StatusModel
            }
         *
         *
         * @returns {JSON} json objet reflecting nested data structure
         */
        toJSON: function(includeNestedModels) {
            // default backbone implementation
            var json = _.clone(this.attributes);
            if (json !== null) {
                // loop through defined keys and call toJSON on each
                if (includeNestedModels === undefined || includeNestedModels === true)
                {
                    for (var key in this.nestedModels)
                    {
                        // confirm object has toJSON() method
                        if (json[key] && json[key] !== null && _(json[key].toJSON).isFunction())
                        {
                            // call toJSON() on object
                            json[key] = json[key].toJSON();
                        }
                    }
                }
            }
            return json;
        },

        getLoadOffset:function(collection, limit)
        {
            if(collection !== null)
            {
                var lastPos = collection.length;
                return Math.ceil(lastPos/limit) + 1;
            }
            return 1;
        },

        resetDefaults:function()
        {
            this.set(this.defaults);
        },

        nullify:function()
        {
            for (var key in this.nestedModels)
            {
                if (this.get(key) && _.isFunction(this.get(key).reset))
                {
                    this.get(key).reset();
                }
            }
            this.clear();
            this.off();
        },
        
        setValidationRules:function()
        {
            /*this.validation = {};
            var that = this;
            _.each(this.validationRules, function(rule){
                that.validation[rule.attribute] = that.setRuleInValidationFormat(rule);
                that.listenTo(that, 'change:'+rule.attribute, that.checkAttributeIsValid);
            });*/
        }//,
        
        /*checkAttributeIsValid:function(model)
        {
            var that = this;
            _.each(model.changed, function(value, key){

                var error = that.checkValidationErrors(key);
                var attrValid = true;
                if(error && error.length > 0)
                {
                    attrValid = false;
                }
                that.trigger('attribute:checkValid', key, attrValid, error);
            });
        }*/
        
        
       
    });
    return BaseModel;
});
