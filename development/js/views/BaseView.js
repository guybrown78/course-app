define([
    'jquery',
    'underscore',
    'backbone'
    
], function($, _, Backbone) {
    
    var BaseView = Backbone.View.extend({
        baseItemClickDebounceTimeout:null,
        baseItemClickDebounceTime:250,
        /**
         * Renders view and returns reference to itself, postRender will be called after page has rendered
         * @override
         */
        render: function() {
            _.defer(_.bind(this.postRender, this));
        },
        
                
        /**
         * Called after completion of render - use when functionality requires completion of page render (e.g. CSS etc)
         */
        postRender: function() {
            // to be overidden
        },
                
        /**/
        baseOnItemClickedHandler:function(event){
            var that = this;
            if(this.baseItemClickDebounceTimeout){
                this.baseClearItemClickedDefer();
                this.onItemDoubleClickedHandler(event);
                return false;
            }
            this.baseItemClickDebounceTimeout = setTimeout(function(){
                that.baseItemClickedDefer(event);
            },that.baseItemClickDebounceTime);
        },
        baseClearItemClickedDefer:function(){
            clearTimeout(this.baseItemClickDebounceTimeout);
            this.baseItemClickDebounceTimeout = null;
        },
        baseItemClickedDefer:function(proxiedEvent){
            this.baseClearItemClickedDefer();
            this.onItemSingleClickedHandler(proxiedEvent);
        },
        onItemSingleClickedHandler:function(proxiedEvent)
        {
            // to be overriden
        },
        onItemDoubleClickedHandler:function(proxiedEvent)
        {
            // to be overriden
        },
                
        /**
         * Appends a list of sub views to specified element
         *
         * @param {HTMLElement} el DOM element to append view to
         * @param {Array} models array of data objects to populate views
         * @param {Class} SubView reference to a Backbone view class- a new instance of this class with be appended for each model in list
         * @returns {Array} subviews created
         */
        appendSubViewsToElement: function(el, models, SubView, args, events, subViewOptions)
        {
            var subViews = [],
                options = subViewOptions !== undefined? subViewOptions : {};
            _.each(models, function(model) {
                options.model = model
                var subView = new SubView(options);
                subViews.push(subView);
                subView.render();
                el.append(subView.el);
            });
            return subViews;
        },
        destroyAppendedViews: function(subViews)
        {
            var subView;
            while (subViews.length > 0) {
                subView = subViews.shift();
                subView.destroy();
                subView = null;
            }
            subViews = null
            return [];
        },
        stripDataIdFromElementId:function(element, delimiter){
            if(!delimiter)
                delimiter = "-";
            var idStrings = element.attr("id").split(delimiter);
            return idStrings[idStrings.length - 1];
        },
        getNoDataMessageHTML:function(msg){
            var html = "<div class='no-data'>";
            html += msg;
            html += "</div>";
            return html;
        },
        getDataErrorMessageHTML:function(msg, title){
            var html = "<div class='data-error'>";
            if(title !== null)
                html += "<h5>" + title + "</h5>";
            html += msg;
            html += "</div>";
            return html;
        },
      
        
        
        setContentsHeightFromParentOffset:function(parentJqueryEL, contentJqueryEL, cssSelector, includeBottomPadding){
            if(!cssSelector)
                cssSelector = "height";
            if(!includeBottomPadding)
                includeBottomPadding = true;
            var availableContentHeight = Math.floor(parentJqueryEL.outerHeight() - this.getContentsOffsetFromParentOffset(parentJqueryEL, contentJqueryEL));
            if(includeBottomPadding)
                availableContentHeight -= Number(contentJqueryEL.css('padding-bottom').replace("px", ""));
            contentJqueryEL.css(cssSelector,  availableContentHeight);
        },
        getContentsOffsetFromParentOffset:function(parentJqueryEL, contentJqueryEL){
            return Math.floor(contentJqueryEL.offset().top - parentJqueryEL.offset().top);
        },  
        onUndevelopedMessageAlert:function()
        {
            this.onAlert("This functionality has not yet been developed", "Not Available");
        },
        
        enableActionButton:function(buttonEl)
        {
            buttonEl.removeClass('disabled');
            buttonEl.removeProp('disabled');
        },
        
        disableActionButton:function(buttonEl)
        {
            buttonEl.addClass('disabled');
            buttonEl.prop('disabled', true);
        },
        
        
        
        destroyModel: function() {
            if(this.model){
                this.model.stopListening();
                this.model = null;
            }
        },
        destroyView: function() {
            this.remove();
            this.unbind();
        },
        destroyEl: function() {
            this.$el.empty();
            this.$el.remove();
        },
        destroy: function() {
            this.destroyModel();
            this.destroyView();
            this.destroyEl();
            this.baseClearItemClickedDefer(); 
            if (this.onDestroy) 
            {
                this.onDestroy();
            }
        }
    });
    
    return BaseView;
});
