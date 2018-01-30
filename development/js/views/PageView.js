define([
    'dataStore',
    'js/views/BaseLoadingView'
    
], function(dataStore, BaseLoadingView) {
    var PageView = BaseLoadingView.extend({
        el:'#pageContent',
       // stageHeight:null,
        contentPadding:null,
        footerHeight:0,
        // specifiy el for loader to be added to
        loaderElId: '#pageContent',
                
        initialize: function(options) {
            BaseLoadingView.prototype.initialize.apply(this);
            dataStore.isLoginPage = false;
            this.events = _.extend({}, BaseLoadingView.prototype.events, this.events);
            this.listenTo(dataStore, 'store:update', this.onDataLoad, this);
            this.listenTo(dataStore, 'store:error', this.onDataLoadError, this);
            //
            this.listenTo(dataStore.get('screenSizeDetection'), 'change:stageHeight', this.onResize, this);
            //$(window).on('resize', _.bind(this.onResize, this));
        },
        
        destroyDataStoreListeners: function() {
            this.stopListening(dataStore, 'store:update');
            this.stopListening(dataStore, 'store:error');
            this.stopListening(dataStore.get('screenSizeDetection'), 'change:stageHeight');
            this.stopListening(dataStore, 'error:login');
        },
        destroyView: function() {
            this.unbind();
            this.undelegateEvents();
            this.stopListening();
        },
        destroyEl: function() {
            this.$el.empty();
        },
        destroy: function() {
            this.destroyDataStoreListeners();
            BaseLoadingView.prototype.destroy.apply(this);
        },
        
        onDataUpdate:function(event)
        {
            this.render();
        },
        
        renderViewContent: function() {
            this.renderPageContent();
            if(dataStore.get('screenSizeDetection').get('stageHeight') !== null && this.contentPadding !== null)
            {
                this.setPageContentHeight();
            }else{
                this.onResize();
            }
        },   
        renderPageContent: function() {
            // to be overidden
        },
                
        // can be overidden
    /*    initialiseLoaderElIdReference:function(){
            this.loaderElId = $(this.loaderElId);
        },*/
        
        onResize: function()
        {
            this.contentPadding = Number(this.jqueryEL.css('padding-top').replace("px", "")) + Number(this.jqueryEL.css('padding-bottom').replace("px", ""));
            this.footerHeight = this.getFooterHeight();
            this.setPageContentHeight();
            this.positionSpinner();
        },
        onHeaderUpdate: function()
        {
            // can be overriden for complex pages that maybe rely on offsets of 
            // page elements to determine the calculated height. 
            this.onResize();
        },
        setPageContentHeight:function()
        {
            var availablePageHeight = Math.floor(dataStore.get('screenSizeDetection').get('stageHeight') - (this.jqueryEL.offset().top +  this.contentPadding)) - this.footerHeight;
            this.jqueryEL.css("min-height",  availablePageHeight);
            this.setAdditionalPageItemsHeight(availablePageHeight);
        },
     
        setAdditionalPageItemsHeight:function(availablePageHeight)
        {
            // can be used to set further DOM items once the availablePageHeight has been calculated
        },
        
        getFooterHeight: function()
        {
            var footers = document.getElementsByTagName('footer');
            if(footers.length){
                return footers[0].offsetHeight;
            }else{
                return 0;
            }
        },
        
        onDataLoad: function(model)
        {
            this.render();
        },
        
        onDataLoadError: function()
        {
            if(this.removeSpinner)
            {
                this.removeSpinner();
            }
            var errorModel = dataStore.get("dataError");
            //only show alert if not 400 error
            //400 are handled with a login popup
            /*if(errorModel.get('status') !== 400 && errorModel.get('status') !== 401)
            {*/
             //   this.onAlert(errorModel.get("displayTitle")+"<br>"+errorModel.get("displayMessage"), "Data error");
            //}
        }
      
    });
    return PageView;
});
