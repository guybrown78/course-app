define([
    'js/data/requestFactory',
    'js/data/models/BaseModel',
    'js/data/collections/BaseCollection'
    
], function(requestFactory, BaseModel, BaseCollection) {

    /**
     * @class BaseTreeModel contains common data for all tree items
     * the foundation parameters to initialise a treeview. All unique models base 
     * these attributes by only adding attributes. The BaseTreeModel is reccursive,
     * Each item in the children collection is a BaseTreeCollection.
     * The initial BaseTreeModel is considered the root of the tree. from that root
     * all it's children and their children are from the inital item. ie; it is assumed
     * that for a recursive tree to exist, the tree must have at least 1 item, 
     * that item is a BaseTreeModel
     */
    var BaseTreeModel = BaseModel.extend({
        type:"Tree",
        childrenLoaded:false,
        parentModel:null,
        rootModel:null,
        additionalIds:null,
        idAttribute:'itemId',
        requiresReload:false,
        defaults:{
            itemId: null,
            displayName: "",
            genericCount:0,
            parentId:null,
            depth: 0,
            childrenCount: 0,
            canEdit:true,
            isOpen:false,
            isSelected:false,
            children: null
        },
        
        initialize:function()
        {
            this.listenTo(this, 'change:isSelected', this.onItemSelected, this);
            BaseModel.prototype.initialize.apply(this);
        },
       url:function(){
           // to be overriden. Each treeview will contain a different model with unique
           // params and unique loading API criterior.
           var jsonURL = "../testjson/tree";
           if(this.loadParams.loadType === "getChildren"){
               jsonURL += "-item-" + this.loadParams.itemId
           }
           jsonURL +=  ".json";
           console.log("json static url = " + jsonURL); 
           return jsonURL;
        },
        parse:function(response)
        {
            if(!response.children)
            {
                response.children = [];
            }
            return this.parseChildren(response);
        },
        
        parseChildren:function(response)
        {
            // additional to backbone's default parse.
            // The API in which the models were designed within use lazy loading,
            // ie; only request 20 items at a time with limit and offset.
            // The children are added to the model's additional id's so the view 
            // can handle lazy loading logic
            if(this.get('children') && this.get('children').length > 0)
            {
                this.additionalIds = _.pluck(response.children, 'itemId');
                this.get('children').add(response.children, {parse:true});
                response = _.omit(response, 'children');
            }
            else
            {
                response.children = new BaseCollection(response.children, {
                    parse: true, model:this.constructor
                });
            }
            return response;
        },
        
        resetChildren:function()
        {
            if(this.get('children') !== null){
                this.get('children').reset();
                this.childrenLoaded = false;
            }
        },
        
        getLoadOffset:function()
        {
            // lazy loading utility to calculate the current offset
            if(this.get('children') !== null)
            {
                var lastPos = this.get('children').length;
                return Math.ceil(lastPos/this.rootModel.get('limit')) + 1;
            }
            return 1;
        },
        
        onLoadSuccess:function()
        {
            // override backbone's onLoadSuccess to check if all children have
            // been loaded (because of lazy loading) and to initialise it's parent
            this.setParentModels();
            if(this.get('children').length === this.get('childrenCount'))
            {
                this.childrenLoaded = true;
            }
        },
        
        setParentModels:function()
        {
            var that = this;
            _.each(this.get('children').models, function(mod)
            {
                mod.parentModel = that;
                mod.rootModel = that.rootModel;
            });
        },
        
        toggleOpenItemChildren:function(open)
        {
            _.each(this.get('children').models, function(mod)
            {
                mod.set('isOpen', open);
            });
        },
        
        toggleOpenNestedChildren:function(open)
        {
            this.set('isOpen', open);
            _.each(this.get('children').models, function(mod)
            {
                mod.toggleOpenNestedChildren(open);
            });
        },
        
        onItemSelected:function()
        {
            //to be overridden - should be handled separately for individual models
        },
        
        getIsAlreadyLoaded:function()
        {
            return false;//this.get('isLoaded');
        },
        
        destroy:function(loadOptions)
        {
            // API delete the item from the DB
            this.loadParams.loadType = "delete"; // needed to determine URL's
            BaseModel.prototype.destroy.apply(this, [loadOptions]);
        },
        getTreeItem:function(itemId)
        {
            if(this.get('itemId') === itemId)
            {
                return this;
            }
            return this.getChildMatch(this.get('children'), 'children', 'itemId', itemId);
        },
        nestedModels:{
            children: BaseCollection
        }
    });
    return BaseTreeModel;
});

