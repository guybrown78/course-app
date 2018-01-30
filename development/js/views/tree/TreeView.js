define([
    'dataStore',
    'js/views/BaseLoadingView',
    'text!js/views/tree/TreeView.html',
    'text!js/views/tree/TreeNodeItem.html'

], function(dataStore, BaseLoadingView, TreeTemplate, TreeNodeItem) {
    /**
     * @class The treeView renders upon js/data/models/tree/BaseTreeModel.
     * It has to be assumed that the tree has at least one item, and that is a
     * Model extended from BaseTreeModel. The tree is rendered in a page as one initial
     * TreeView. The model that drives it can contain children, those children are looped
     * and if a child has properties, the treeView will create another instance
     * of itself within itself. Each instance of treeView only concerns itself with the
     * items model and it's children. It doesn't need to know any parental history.
     * TreeView is designed not to be extended. You get unique functionality from unique
     * treeNodeItem's passed in and also from event handlers for every unique instance of an 
     * extended BaseTreeModel
     */
    var treeView = BaseLoadingView.extend({

        tagName: 'li',
        collapseSpeed:250, // animation speed of the tree (ms)
        depthIndent:10, // depth indent. usually multiplied by the depth integer for each model. EG; padding-left = this.model.depth * this.depthIndent + 'px';
        childTreeViews:null,
        nodeItemTemplate:TreeNodeItem, // default node item template that has generic open/close arrow and displayName. Should be overridden to the specific page/model
        nodeItemHeight:30, // The height of the node item once rendered. Used to determine the height of the tree EL while loading
        nodeItemEL:'.tree-node-item', // element that opens/closes and contains the ui nodeTree
        nodeChildrenEL:'.tree-node-item-children', // ui element that contains all the children
        openCloseNodeItem:true, // set to true to toggle open and close of node item. Set to false and node item doesn't open/close
        openCloseArrowOnly:false, // set to true to toggle open and close of node arrow if it has children.
        arrowEL:".cel-arrow", // arrow icon element within nodeItem to visualize open and close#
        showArrowEL:true, // display arrow icon element
        loadChildrenInternally:true, // on open of a node, if the item has chldren then an internal load is requested in this tree view instance model. setting this to false will trigger a loadChildren event
        isModelLoading:false,
        // additionalNodeStateParams/Value/Selector are all part of the same group. If Params is Passed in then Value and Selector is passed in
        additionalNodeStateParams:null, // Similar to 'isSelected', the node can have additional states such as 'isAttached'. The Param is included and listened to 'change' within the model
        additionalNodeStateValue:null, // Action to be taken on if the additionalNodeStateParams equals the additionalNodeStateValue in the 'change' handler
        additionalNodeStateSelector:"", // CSS selector to be added to the node if additionalNodeStateParams equals the additionalNodeStateValue in the 'change' handler
        //
        additionalModelListenersHandlers:null, // ROUGH  set of listeners to check for changes in the model that should be updated in the tree node
        additionalRenderFunction:null, // 
        specifyDepth:true, // A tree call can have a parameter to load only the immediate children of a model or all children. If specifyDepth is set to true, only the immediate children will be loaded. If specifyDepth is false, the whole tree will be loaded in the first call.
        initialize: function(options) {
            BaseLoadingView.prototype.initialize.apply(this);
            if (options || typeof options === 'object') {
                this.options = options;
                this.setOptionParams();
            }else{
                this.template = _.template(TreeTemplate);
            }
            this.treeView = treeView;
            this.childTreeViews = [];
            // When models children change
            this.model.bind('change:children', this.onChildrenLoaded, this);
            this.listenTo(this.model, 'change:isSelected', this.onSelectedStateChange, this);
            this.listenTo(this.model, 'deleteSuccess', this.onItemDelete, this);
            this.listenTo(this.model, 'change:'+this.additionalNodeStateParams, this.onAdditionalNodeStateParamsChange, this);
            // ROUGH
            if(this.additionalModelListenersHandlers && this.additionalModelListenersHandlers.length > 0){
                var that = this;
                _.each(this.additionalModelListenersHandlers, function(obj) {
                    that.listenTo(that.model, obj.listener, obj.handler, that);
                });
            }
            this.model.set('viewReference', this);    
            this.name = "treeview";
          //  this.initialiseEvents();
        },
        
        setOptionParams:function(){
            // If a template is not passed in the options, set the template to the default tree template
            this.template = this.options.template === undefined ? _.template(TreeTemplate) : _.template(this.options.template);
            // If speed not specified, set to 250ms by default
            this.collapseSpeed = this.options.collapseSpeed === undefined ? this.collapseSpeed : parseInt(this.options.collapseSpeed, 10);
            // If openCloseArrowOnly is specified, set it to options value
            if (this.options.openCloseArrowOnly !== undefined) {
                this.openCloseArrowOnly = this.options.openCloseArrowOnly;
            }
            // If openCloseNodeItem is specified, set it to options value
            if (this.options.openCloseNodeItem !== undefined) {
                this.openCloseNodeItem = this.options.openCloseNodeItem;
            }
            // If nodeItemTemplate is specified, use it instead of the default generic node item template
            if (this.options.nodeItemTemplate !== undefined) {
                this.nodeItemTemplate = this.options.nodeItemTemplate;
            }
            // If nodeItemHeight is specified, use it instead of the default
            if (this.options.nodeItemHeight !== undefined) {
                this.nodeItemHeight = this.options.nodeItemHeight;
            }
            // If arrowEL is specified, use it instead of the default arrowEL depending on the this.nodeItemTemplate markup
            if (this.options.arrowEL !== undefined) {
                this.arrowEL = this.options.arrowEL;
            }
            // If loadChildrenInternally is specified, use it instead of the default loadChildrenInternally flag
            if (this.options.loadChildrenInternally !== undefined) {
                this.loadChildrenInternally = this.options.loadChildrenInternally;
            }
            // If a getChildren LoadParams object is not passed in the options, set the getChildrenLoadParams to an empty object 
            this.getChildrenLoadParams = this.options.getChildrenLoadParams === undefined ? {} : this.options.getChildrenLoadParams;
            //
            // If an additionalNodeStateParams is passed into the tree
            if (this.options.additionalNodeStateParams !== undefined) {
                this.additionalNodeStateParams = this.options.additionalNodeStateParams;
                this.additionalNodeStateValue = this.options.additionalNodeStateValue;
                this.additionalNodeStateSelector = this.options.additionalNodeStateSelector;
            }
            // ADD FOR NEW DEPTH BASED CALLS 
            if (this.options.specifyDepth !== undefined) {
                this.specifyDepth = this.options.specifyDepth;
            }
            
            // ROUGH
            if (this.options.additionalModelListenersHandlers !== undefined) {
                this.additionalModelListenersHandlers = this.options.additionalModelListenersHandlers;
            }
            //
            if (this.options.additionalRenderFunction !== undefined){
                this.additionalRenderFunction = this.options.additionalRenderFunction;
            }
        },
          
        events:{},
        
        initialiseEvents:function()
        {
            var that = this;
            if(this.openCloseNodeItem)
            {
                if(this.model.get("childrenCount") > 0)
                {
                    $(this.el).find(' > ' + this.nodeItemEL).click(function() { 
                            return that.onNodeItemSelected(); 
                        });
                }
            }else if(this.openCloseArrowOnly){
                if(this.model.get("childrenCount") > 0)
                {
                    $(this.el).find(' > ' + this.nodeItemEL).find(' > ' + this.arrowEL).click(function() { 
                            return that.onNodeItemSelected(); 
                        });
                }
            }
        },

        onNodeItemSelected:function(event)
        {
            if(this.model.get("childrenCount") > 0 && this.model.get("children").length === 0)
            {
                this.toggleOpenState();
                this.setLoadingState();
                this.loadChildren();
            }
            else
            {
                this.toggleOpenState();
            }
        },
        
        loadChildren:function()
        {
            if(this.loadChildrenInternally){
                //roleId:dataStore.get('userSession').get('user').get('currentRoleId'), qualId:dataStore.get('currentQualId')
                this.isModelLoading = true;
                this.getChildrenLoadParams.itemId = this.model.get('itemId');
                if(this.specifyDepth)
                {
                    this.getChildrenLoadParams.depth = this.model.get('depth') + 1;
                }
                this.model.loadParams = this.getChildrenLoadParams;
                var loadOptions = dataStore.getBasicLoadOptions();
                this.model.load(loadOptions);
            }else{
                this.trigger('tree:loadChildren', this.model);
            }
        },
        setLoadingState:function()
        {
            var childrenEL = $(this.el).find('> ' + this.nodeChildrenEL),
                    that = this,
                   h =  Number(this.model.get('childrenCount'))* this.nodeItemHeight,
                   depth = (this.model.get('depth') + 1) * this.depthIndent,
                   loader = "<li class='loading' style='margin-left:" + depth + "px;'></li>";
            childrenEL.html(loader);
            this.loaderElId = childrenEL;
            childrenEL.find('.loading').animate({
                'height': h
            }, this.collapseSpeed, function() {
                // Animation complete.
                if(that.isModelLoading)
                    that.showLoader();
            });
            
        },
        toggleOpenState: function() 
        {
            if (this.model.get("isOpen") === true)
            {
                //this.model.set('viewReference', null);
                this.closeNode();
                this.model.set("isOpen", false);
            }
            else
            {
                //this.model.set('viewReference', this);
                this.openNode();
                this.model.set("isOpen", true);
            }
        },

        closeNode:function()
        {
            if(this.showArrowEL)
            {
                //var arrow = $(this.el).find('> ' + this.arrowEL + " > div");
                var arrow = $(this.el).find(' > ' + this.nodeItemEL).find(this.arrowEL + " > div");
                arrow.removeClass('open');
                this.model.get('childrenCount') > 0?arrow.addClass('closed'):arrow.addClass('closedNoChildren');
                
            }
            $(this.el).find('> ' + this.nodeChildrenEL).slideUp(this.collapseSpeed).promise().always(this.onSlideAnimationPromise);
        },
        
        openNode:function()
        {
            if(this.showArrowEL)
            {
                //var arrow = $(this.el).find('> ' + this.arrowEL + " > div");
                var arrow = $(this.el).find(' > ' + this.nodeItemEL).find(this.arrowEL + " > div");
                arrow.removeClass('closed');
                arrow.addClass('open');
            }
            $(this.el).find('> ' + this.nodeChildrenEL).slideDown(this.collapseSpeed).promise().always(this.onSlideAnimationPromise);
        },
        
        onSlideAnimationPromise:function()
        {
            // to be overriden
        },
        render: function() 
        {
            // Attach the HTML created in the views template to the views el
            $(this.el).html(this.template(this.getTemplateData()));
            this.initialiseEvents();
            this.addChildrenInstances();
            // adjust the view elements according to the model's open status
            if(this.model.get("isOpen") === true)
            {
                if(this.model.get('childrenCount') > 0 && this.model.get('children').length === 0)
                {
                    this.closeNode();
                }
                else
                {
                    this.openNodePostRender();
                }
            }
            if(this.additionalRenderFunction !== null){
                this.additionalRenderFunction(this);
            }
        },
        addChildrenInstances:function()
        {
            if(this.model.get("children") === null || this.model.get("children").length <= 0)
                return false;
            // Build child views, insert and render each
            var tree = $(this.el).find('> ' + this.nodeChildrenEL);
            var loadingEL = tree.find(".loading");
            var childViewOptions = this.options;
            childViewOptions.el = null;
            var that = this;
            //this.model.get("children")
            _.each(this.model.get("children").models, function(childModel, i) {
                childViewOptions.model = childModel;
                var childView = new this.treeView(childViewOptions);
                childView.render();
                //tree.prepend(childView.$el);
                tree.append(childView.$el);
                if(loadingEL){
                    loadingEL.css("height", loadingEL.outerHeight() - this.nodeItemHeight);
                }
                that.childTreeViews.push(childView);
            }, this);
        },
        onChildrenLoaded:function()
        {
            this.isModelLoading = false;
            this.removeSpinner();
            // reset any show loader states
            var childrenEL = $(this.el).find('> ' + this.nodeChildrenEL);
            //childrenEL.removeClass("loading");
            this.addChildrenInstances();
            //childrenEL.css('min-height', "");
            childrenEL.find('.loading').remove();
        },

        onItemDelete:function()
        {
            this.model.onDestroy();
            this.destroy();
        },
        /*
         * Can be overriden to add additional params to the template data that
         * currently don't reside within the model
         */
        getTemplateData:function()
        {
            //this.model.set('isOpen', this.model.get('children').models.length > 0);
            //this.model.set('hasChildren', this.model.get('children').models.length > 0);
            var treeData = this.model.toJSON();
            treeData.depthIndent = this.depthIndent;
            treeData.nodeItemTemplate = _.template(this.getNodeItemTemplate())(treeData);
            
            return treeData;
        },
        getNodeItemTemplate:function()
        {
            return this.nodeItemTemplate;
        },
        openNodePostRender:function()
        {
            // can be overriden if an external view need initialising prior to opening
            this.openNode();
        },
                
        showLoader:function()
        {
            BaseLoadingView.prototype.showLoader.apply(this);
        },
        removeSpinner:function()
        {
            BaseLoadingView.prototype.removeSpinner.apply(this);
        },
        positionSpinner: function()
        {
            if (this.spinnerEL && this.showSpinner)
            {
                this.spinnerEL.css("position", "relative");
                var x = Math.floor($(this.loaderElId).outerWidth() / 2);
                this.spinnerEL.css("left", x + "px");
                var y = Math.floor($(this.loaderElId).outerHeight() / 2);
                this.spinnerEL.css("top", -y + "px");
            }
        },
        
        onSelectedStateChange:function()
        {
            if(this.model.get('isSelected')){
                $(this.el).find('> .tree-node-item').addClass('selected');
            }else{
                $(this.el).find('> .tree-node-item').removeClass('selected');
            }
        },
        onAdditionalNodeStateParamsChange:function()
        {
            if(this.model.get(this.additionalNodeStateParams) === this.additionalNodeStateValue){
                $(this.el).find('> .tree-node-item').addClass(this.additionalNodeStateSelector);
            }else{
                $(this.el).find('> .tree-node-item').removeClass(this.additionalNodeStateSelector);
            }
        },      
        destroy: function()
        {
            while(this.childTreeViews.length > 0)
            {
                var childTreeView = this.childTreeViews.pop();
                if(childTreeView !== null)
                {
                    childTreeView.destroy();
                    childTreeView = null;
                }
            }
            if(this.model !== null)
            {
                this.model.unbind('change:children', this.onChildrenLoaded, this);
                this.stopListening(this.model, 'change:isSelected', this.onSelectedStateChange, this);
                this.stopListening(this.model, 'deleteSuccess', this.onItemDelete, this);
                this.model = null;
            }
            this.remove();
            BaseLoadingView.prototype.destroy.apply(this);
        }       
    });
    
    return treeView;
});
