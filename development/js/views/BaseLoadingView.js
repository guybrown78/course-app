define([
    'dataStore',
    'js/views/BaseView',
    'spinner'
    
], function(dataStore, BaseView, Spinner) {
    var BaseLoadingView = BaseView.extend({
        dataRequested:false,
        title:"",
        viewType:"",
     //   loaderElId:el,
        initialLoadRenderRenderComplete: false,
        showSpinner: true,
        spinnerCurrentlyVisable: false,
        /**
         * Spinning loader config options
         */
        loaderOptions: {
            lines: 8, // The number of lines to draw
            length: 0, // The length of each line
            width: 7, // The line thickness
            radius: 10, // The radius of the inner circle
            corners: 20, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            color: '#008080', // #rgb or #rrggbb00193C
            speed: 1, // Rounds per second
            trail: 60, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9 // The z-index (defaults to 2000000000)
        },
                
        initialize: function(options) {
            BaseView.prototype.initialize.apply(this);
            this.viewNumber = Math.floor(Math.random() * (10000000 - 100 + 1)) + 100;
            if(!this.loaderElId){
                this.loaderElId = this.el;
            }
            this.jqueryEL = $(this.el);
            //
            if (this.name){
                this.loaderOptions.className = this.loaderOptions.className + "-" + this.name;
            }
        },
        

                
       /* destroy: function() {
            // destroy spinner
            BaseView.prototype.destroy.apply(this);
        },*/
        
        render: function() {
            if(!this.initialLoadRenderRenderComplete){
                this.initialLoadRenderRenderComplete = true;
                this.initialLoadRender();
            }
            if (!this.dataRequested)
            {
                // show loading spinner if view has loadData method
                this.showLoader();
                // trigger data load
                this.dataRequested = true;
                var queue = [];
                this.requestData(queue);
            }
            else
            {
                // show page content
                this.removeSpinner();
                this.renderViewContent();
                this.initialiseLoaderElIdReference();
            }
            BaseView.prototype.render.apply(this);
            return this;
        },
        
        requestData:function(queue)
        {   
            dataStore.checkUserLoad(queue)
            if(queue.length > 0)
            {
                dataStore.loadData(queue);
            }
            else
            {
                this.render();
            }
        },
        
        initialLoadRender: function() {
            // to be overidden
        },
        renderViewContent: function() {
            // to be overidden
        },
                
        // can be overidden
        initialiseLoaderElIdReference:function(){
            this.loaderElId = $(this.loaderElId);
        },    
        showLoader: function()
        {
            if(this.showSpinner){
                this.removeSpinner();
                var spinner = new Spinner(this.loaderOptions).spin(),
                    spinnerClass = "." + this.loaderOptions.className;
                this.spinnerCurrentlyVisable = true;
                $(this.loaderElId).append(spinner.el);
                this.spinnerEL = $(this.loaderElId).find(String("." + this.loaderOptions.className));
                this.positionSpinner();
                
            }
        },
        /**
         *Remove loading spinner
         */
        removeSpinner:function()
        {
            if (this.spinnerEL && this.spinnerCurrentlyVisable){
                this.spinnerEL.empty().detach();
                this.spinnerCurrentlyVisable = false;
            }
        },
         /**
         *Update position of loading spinner
         */
        positionSpinner: function()
        {
            // find spinner if present
            if (this.spinnerEL && this.showSpinner)
            {
                this.spinnerEL.css("position", "absolute");
                var x = Math.floor(($(this.loaderElId).outerWidth() / 2) + $(this.loaderElId).offset().left);
                this.spinnerEL.css("left", x + "px");
                var y = Math.floor(($(this.loaderElId).outerHeight() / 2) + $(this.loaderElId).offset().top) + this.getScrollTop();
                this.spinnerEL.css("top", y + "px");
            }
        },
        /*
        setContentsHeightFromParentOffset:function(parentJqueryEL, contentJqueryEL, cssSelector){
            if(!cssSelector)
                cssSelector = "height";
            var availableContentHeight = Math.floor(parentJqueryEL.outerHeight() - (contentJqueryEL.offset().top - parentJqueryEL.offset().top));
            contentJqueryEL.css(cssSelector,  availableContentHeight);
        },
        getContentsOffsetFromParentOffset:function(parentJqueryEL, contentJqueryEL){
            return Math.floor(contentJqueryEL.offset().top - parentJqueryEL.offset().top);
        },     
        */
        /**
         * return scroll y position
         * @returns {Number}
         */
        getScrollTop: function() {
            if (typeof pageYOffset !== 'undefined') {
                //most browsers
                return pageYOffset;
            }
            else {
                var B = document.body, //IE 'quirks'
                    D = document.documentElement; //IE with doctype
                D = (D.clientHeight) ? D : B;
                return D.scrollTop;
            }
        },
        
        onDataLoadError: function(event, jqXHR, settings, exception)
        {
            //console.log("error caught in page view");
            if(this.removeSpinner)
            {
                this.removeSpinner();
            }
            var errorModel = dataStore.getCustomDataError(jqXHR, exception);
            this.showLoadErrorMessage(errorModel);
        },
        
        showLoadErrorMessage:function()
        {
            //to be overridden
        }
        
    });
    return BaseLoadingView;
});
