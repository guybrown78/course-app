define([
    'dataStore',
    'js/views/BaseLoadingView',
    'text!js/views/sectionsStack/section/BaseSection.html',
    'text!js/views/sectionsStack/section/BaseSectionHeader.html'
  
], function(dataStore, BaseView, BaseSectionTemplate, BaseSectionHeaderTemplate) {

    var BaseSectionView = BaseView.extend({
        name:"BaseSection",
        title:"Section title",
        model:null,
        template:null,
        headerTemplate:null,
        showHeader:true,
        index:null,
        isOpen:false,
        restrictHeightToScreen:false,
        //
        topOffset:0,
        contentOffset:0,
        verticalPadding:0,
        sectionBottomPadding:0,
        sectionEL:null,
        contentEL:null,
        openCloseButtonEL:null,
        openCloseButtonWidth:30,
        rendered:null,
        nullModelMessage:"There is currently no item selected",
        //
        initialize: function(options) {
            this.events = _.extend({}, BaseSectionView.prototype.events, this.events);
            BaseView.prototype.initialize.apply(this);
            this.initialiseViewParametersFromOptions(options);
            this.initialiseLayoutTemplate();
            this.initialiseHeaderTemplate();
            if(this.model !== null){
                this.initialiseModelListeners();
            }
        },
        initialiseViewParametersFromOptions:function(options)
        {
            if (options.isOpen !== undefined) 
            {
                this.isOpen = options.isOpen;
            }
            if (options.showHeader !== undefined) 
            {
                this.showHeader = options.showHeader;
            }
            if (options.title !== undefined) 
            {
                this.title = options.title;
            }
            if (options.restrictHeightToScreen !== undefined) 
            {
                this.restrictHeightToScreen = options.restrictHeightToScreen;
            }
        },
        initialiseLayoutTemplate:function()
        {
            this.template = _.template(BaseSectionTemplate);
        },
        initialiseHeaderTemplate:function()
        {
            this.headerTemplate = _.template(BaseSectionHeaderTemplate);
        },
        events:
        {
            "click .toggle-open-close":"onOpenCloseToggle"
        },
     
        render: function()
        {
            $(this.el).html(this.template(this.getTemplateData()));
            this.sectionEL = $(this.el).find('.section-stack-container');
            BaseView.prototype.render.apply(this);
        },
        getTemplateData:function(){
            var data = {};
            data.showHeader = this.showHeader;
            data.index = this.index;
            return data;
        },
        postRender:function()
        {
            if(this.index > 0){
                this.openCloseButtonEL  = $(this.el).find('.action-button.toggle-open-close');
                this.openCloseButtonWidth = this.openCloseButtonEL.outerWidth();
            }
            this.contentEL = $(this.el).find('.content').first();
            this.initialiseViewCalculations();
            this.rendered = true;
            if(!this.isOpen){
                this.close();
                if(this.height)
                    this.setHeight(this.height);
            }else{
                this.renderSection();
            }
            //
            var columnEL = document.getElementsByClassName('flex-column')[this.index],
                that = this;
            this.prefixedEventListener(columnEL,"transitionEnd",function(e){
                that.onTransistionComplete(e);
            });
        },
        
        prefixedEventListener:function(element, type, callback) {
            var pfx = ["webkit", "moz", "MS", "o", ""];
            for (var p = 0; p < pfx.length; p++) {
                if (!pfx[p]) type = type.toLowerCase();
                element.addEventListener(pfx[p]+type, callback, false);
            }
        },
        onTransistionComplete:function(event){
            event.stopPropagation();
            this.initialiseViewCalculations();
            if(this.height)
                this.setHeight(this.height);
        },
        initialiseViewCalculations:function()
        {
            this.verticalPadding = Number($(this.el).css('padding-top').replace("px", "")) + Number($(this.el).css('padding-bottom').replace("px", ""));
            if(this.contentEL.offset().top > 0)
                this.contentOffset = Math.ceil(this.contentEL.offset().top - $(this.el).offset().top);
            this.sectionBottomPadding = Number($(this.sectionEL).css('padding-bottom').replace("px", ""));
        },
             
        renderSection:function()
        {   
            if(!this.isOpen)
                this.onOpenCloseToggle();
            this.sectionEL.find('header').html(this.headerTemplate(this.getHeaderTemplateData()));
            this.renderSectionsContent();
            //
            this.initialiseViewCalculations();
            if(this.height)
                this.setHeight(this.height);
            //this.events();
           /* this.events = _.extend({
            }, BaseView.prototype.events, this.events);
            this.delegateEvents();*/
        },
        
        renderSectionsContent:function()
        {
            if(this.model !== null){
                this.contentEL.html("Rendered :)");
            }else{
                this.contentEL.html(this.getNoDataMessageHTML(this.nullModelMessage));
            }
        },
      

        getHeaderTemplateData:function(){
            var data = {};
            if(this.model !== null){
                data = this.model.toJSON();
            }else{
                data.displayName = this.title;
            }
            return data;
        },
        onDataLoadError:function(event, jqXHR, settings, exception)
        {
            var statusError = dataStore.getCustomDataError(jqXHR, exception);
            // step 1, decide which 'loadType' caused the error, ie loadType:editDescription or editName
            var loadType = settings.loadType;
            // step 2, find the form item view that acts on behalf of the current loadType error from step 1
        },

        updateModel: function(currentSelectedModel)
        {
            this.destroyModel();
            this.model = currentSelectedModel;
            this.initialiseModelListeners();
            this.renderSection();
        },
        
        onOpenCloseToggle:function(event)
        {
            if(this.isOpen){
                this.isOpen = false;
                this.close();
            }else{
                this.isOpen = true;
                this.open();
                this.renderSection();
            }
            this.trigger('sectionStackView:openClose', this.isOpen? "open" : "close", this.index);
        },
        close:function()
        {
            //this.openCloseButtonEL.find('.arrow').removeClass('right-rotate').addClass('left-rotate');
            this.openCloseButtonEL.find('.arrow').removeClass('open').addClass('closed');
            this.sectionEL.addClass('closed');
        },
        open:function()
        {
            this.openCloseButtonEL.show();
            //this.openCloseButtonEL.find('.arrow').removeClass('left-rotate').addClass('right-rotate');
            this.openCloseButtonEL.find('.arrow').removeClass('closed').addClass('open');
            this.sectionEL.removeClass('closed');
        },       
        setTopOffset:function(offset){
            this.topOffset = offset;
            $(this.el).css('margin-top', this.topOffset > 0 ? this.topOffset + this.verticalPadding : this.topOffset + "px");
        },
        setHeight:function(height){
            this.height = height;
            if(this.rendered){
                var h = this.topOffset > 0 ? this.height - this.verticalPadding : this.height
                var contentHeight = (h - (this.contentOffset + this.verticalPadding));
                if(this.sectionBottomPadding > 0)
                    contentHeight = contentHeight - this.sectionBottomPadding;
                if(this.restrictHeightToScreen){
                    this.sectionEL.css('height', (h - this.verticalPadding) + "px");
                    if(this.contentEL){
                        this.contentEL.css('height', contentHeight + "px");
                        this.setAdditionalViewItemHeights(contentHeight);
                    }
                }else{
                    this.setAdditionalViewItemHeights(contentHeight);
                }
                
                
                /*if(this.contentEL){
                    this.contentEL.css('height', contentHeight + "px");
                    this.setAdditionalViewItemHeights(contentHeight);
                }*/
            }
        },
        setAdditionalViewItemHeights: function(contentHeight){
            // to be overriden
        },
        initialiseModelListeners: function() {
            // to be overriden
        },
        removeModelListeners: function() {
            // to be overriden
        },
        destroyModel: function() {
            if(this.model !== null){
                this.removeModelListeners();
            }
            BaseView.prototype.destroyModel.apply(this);
        },
        destroy:function()
        {
            this.template = null;
            this.name = null;
            this.el = null;
            BaseView.prototype.destroy.apply(this);
        }
    });
    return BaseSectionView;
});
