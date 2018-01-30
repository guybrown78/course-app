define([
    'dataStore',
    'js/views/PageView',
    'text!js/views/sectionsStack/SectionsStackLayout.html',
    'js/views/sectionsStack/section/BaseSectionView'
    
], function(dataStore, PageView, LayoutTemplate, BaseSectionView) {

    var BasePageSectionsStackView = PageView.extend({
        name:"Base sections stack page view",
        articleId:"basePageSectionsStackContent",
        gridClass:"page-section-stack-grid",
        gridType:"dual-focus", // dual-focus|| slider
        currentDefaultFocusedIndex:0,
        currentFocusedIndex:0,
        sectionsStack:null,
        topOffset:0,
        enableSliding:false,
        gridEL:null,
        elementsOffsetY:null,
        renderedPageContent:false,
        //
        initialize: function(options)
        {
            PageView.prototype.initialize.apply(this, [options]);
            dataStore.isLoading = false;
            this.initialiseLayoutTemplate();
            this.initialiseModel();
            this.sectionsStack = [];
            this.initialiseSectionsStack();
            //
            this.listenTo(dataStore.get('deviceDetection'), 'change:screenSize', this.onDeviceDetectionChange, this);
            this.listenTo(dataStore.get('screenSizeDetection'), 'change:stageWidth', this.onStageWidthResize, this);
            this.enableSliding = this.getEnableSliding();
            $(window).on('scroll', _.bind(this.onScroll, this));
        },
        initialiseLayoutTemplate:function()
        {
            this.template = _.template(LayoutTemplate);
        },
        initialiseModel:function()
        {
            // to be overrideen
            //this.model = dataStore...
        },
        initialiseSectionsStack:function()
        {
            this.sectionsStack.push({
                view:new BaseSectionView({
                    isOpen:true,
                    restrictHeightToScreen:false,
                    showHeader:false
                }),
                class:"primary",
                ordinal: 1
            });
            this.sectionsStack.push({
                view:new BaseSectionView({
                    isOpen:false,
                    restrictHeightToScreen:true
                }),
                class:"secondary",
                ordinal: 2
            });
        },
        getEnableSliding:function()
        {
            if(this.gridType === "slider"){
                return true;
            }else if(dataStore.get('deviceDetection').get('screenSize') !== "screenLarge"){
                return true;
            }else if(this.sectionsStack.length > 2){
                return true;
            }
            return false;
        },
        setEnableSliding:function(flag)
        {
            var hasEnableSlidingChanged = flag !== this.enableSliding;
            this.enableSliding = flag;
            if(hasEnableSlidingChanged)
                this.slideToSection(this.currentFocusedIndex, false);
        },
        events:{
           //
        },
        
        renderPageContent:function(){
            $(this.el).html(this.template(this.getTemplateData()));
            this.gridEL = $(this.el).find('.grid.' + this.gridClass);
            //
            this.initialiseViewCalculations();
            this.initialiseSectionsStackViews();
            //
            this.renderedPageContent = true;
            this.delegateEvents();
        },
        getTemplateData:function(){
            var data = {};
            data.pageTitle = this.name;
            data.articleId = this.articleId;
            data.sectionsStack = this.sectionsStack;
            data.gridClass = this.gridClass;
            data.gridType = this.gridType;
            data.currentFocusedIndex = this.currentFocusedIndex
            return data;
        },
             
        initialiseSectionsStackViews:function()
        {
            var that = this;
            _.each(this.sectionsStack, function(section, index){
                that.addSectionsStackViewsListeners(section.view, index);
                //section.view.el = that.gridEL.find('[data-item-ordinal="'+section.ordinal+'"]');// > section.section-stack-item');
                section.view.setElement(that.gridEL.find('[data-item-ordinal="'+section.ordinal+'"]'));
                section.view.index = index;
                section.view.render();
            });
        },
        addSectionsStackViewsListeners:function(sectionView, index)
        {
            switch(index){
                case 0:
                    this.listenTo(sectionView, 'sectionStackView:itemSelect', this.onSectionItemSelected, this);
                    break;
                case 1:
                    this.listenTo(sectionView, 'sectionStackView:openClose', this.onSectionViewOpenClose, this);
                    break;
            }
        },
        removeSectionsStackViewsListeners:function(sectionView, index)
        {
            switch(index){
                case 0:
                    this.stopListening(sectionView, 'sectionStackView:itemSelect', this.onSectionItemSelected);
                    break;
                case 1:
                    this.stopListening(sectionView, 'sectionStackView:openClose', this.onSectionViewOpenClose);
                    break;
            }
        },
        onHeaderUpdate: function()
        {
            this.initialiseViewCalculations();
            this.setAdditionalPageItemsHeight();
        },
        onDeviceDetectionChange:function()
        {
            this.initialiseViewCalculations();
            this.updateNodeDetailsView();
            this.setAdditionalPageItemsHeight();
        },
        initialiseViewCalculations:function()
        {
            this.elementsOffsetY = this.gridEL !== null ? Math.ceil($(this.gridEL).offset().top) : 0;
        },
                
        onStageWidthResize: function()
        {
            if(this.enableSliding && this.currentFocusedIndex > 0)
                this.slideToSection(this.currentFocusedIndex, false);
        },

        setAdditionalPageItemsHeight:function(availablePageHeight)
        {
            this.setSectionsStackViewHeights();
        },
        setSectionsStackViewHeights:function(scrollTop)
        {
            scrollTop = scrollTop === undefined ? $(window).scrollTop() : scrollTop;
            if(this.renderedPageContent){
                var h = (dataStore.get('screenSizeDetection').get('stageHeight') - this.elementsOffsetY) + (scrollTop - this.topOffset);
                this.gridEL.css('min-height', h);
                _.each(this.sectionsStack, function(section, index){
                    //if(section.view.restrictHeightToScreen){
                        section.view.setHeight(h);
                    //}
                });
            }
        },
        onScroll: function()
        {
            if(this.renderedPageContent){
                var scrollTop = $(window).scrollTop();
                this.topOffset = (scrollTop - this.elementsOffsetY);// + this.sectionsStack[this.currentSection].view.verticalPadding;
                if(this.topOffset < 0)
                    this.topOffset = 0;
                var that = this;
                _.each(this.sectionsStack, function(section, index){
                    if(section.view.restrictHeightToScreen){
                        section.view.setTopOffset(that.topOffset);
                   }
                });
                this.setSectionsStackViewHeights(scrollTop);
            }
        }, 
        updateNodeDetailsView:function()
        {
            this.setEnableSliding(true);
            //
            /*
             * 
             * GUY. Not really sure why this is in to be honest.
            It seems to cause a bug with the slide stack options. 
            The bug was when the device width went from large to <large and back again.
            It then wouldn't slide to the appropriate stack ordinal and caused further
            ugly re-draw problems thereafter. 
            Seemed safer to just set it to always slide as i could figure out why we wouldn't.
            
            switch(dataStore.get('deviceDetection').get('screenSize'))
            {
                case "screenSmall":
                case "screenMedium":
                    this.setEnableSliding(true);
                    break;
                case "screenLarge":
                default:
                    this.setEnableSliding(false);
                    break;
            }
            */
        },
        onSectionViewOpenClose: function(direction, index)
        {
            if(index !== 0){
                if(direction === "close"){
                    this.currentFocusedIndex = index - 1;//this.currentDefaultFocusedIndex;
                    //
                }else{
                    this.currentFocusedIndex = index;
                }
            }
            this.gridEL.removeData('data-focused-item-ordinal');
            this.gridEL.removeData('data-focused-index');
            this.gridEL.attr('data-focused-item-ordinal', this.sectionsStack[this.currentFocusedIndex].ordinal);
            this.gridEL.attr('data-focused-index', this.currentFocusedIndex);
            if(this.enableSliding){
                this.slideToSection(this.currentFocusedIndex);
            }
        },
        onSectionItemSelected: function(item, index)
        {
            /*if(index === 0){
                var temporaryModel = new Backbone.Model({ displayName: "Item " + item, id:item});
                this.sectionsStack[1].view.updateModel(temporaryModel);
            }*/
        },
        slideToSection:function(sectionIndex, animate){
            if(this.renderedPageContent){
                var gridWidth = this.gridEL.innerWidth(),
                    scrollPos = gridWidth * sectionIndex;
                    animate = animate === undefined?true:animate;
                if(animate){
                    this.gridEL.animate({scrollLeft: scrollPos});
                }else{
                    this.gridEL.scrollLeft(scrollPos);
                }
            }
            
        },
        destroyDataStoreListeners: function() {
            this.stopListening(dataStore.get('deviceDetection'), 'change:screenSize');
            this.stopListening(dataStore.get('screenSizeDetection'), 'change:stageWidth');
            PageView.prototype.destroyDataStoreListeners.apply(this);
        },
        destroySectionsStackViews:function(){
            var that = this;
            _.each(this.sectionsStack, function(section, index){
                that.removeSectionsStackViewsListeners(section.view, index);
                section.view.destroy();
                section.view = null;
            });
        },
        destroySectionsStack:function(){
            this.destroySectionsStackViews();
            var sectionStackItem;
            while (this.sectionsStack.length > 0) {
                sectionStackItem = this.sectionsStack.shift();
                sectionStackItem = null;
            }
            this.sectionsStack = [];
        },
        destroy:function()
        {
            this.destroySectionsStack();
            PageView.prototype.destroy.apply(this);
        }
    });
    return BasePageSectionsStackView;
});
