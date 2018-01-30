define([
    'dataStore',
    'js/views/sectionsStack/BaseSectionsStackPageView',
    'js/views/sectionsStack/examples/sections/PrimarySectionView',
    'js/views/sectionsStack/examples/sections/SecondarySectionView',
    
], function(dataStore, BaseSectionsStackPageView, PrimarySectionView, SecondarySectionView) {

    var DualFocusSectionsStackView = BaseSectionsStackPageView.extend({
        name:"Dual-focus stack page view example",
        articleId:"basePageSectionsStackContent",
        gridClass:"page-section-stack-grid",
        gridType:"dual-focus", // dual-focus || slider
        currentDefaultFocusedIndex:0,
        currentFocusedIndex:0,
        //
        initialize: function(options)
        {
            BaseSectionsStackPageView.prototype.initialize.apply(this, [options]);
        },
 
        initialiseModel:function()
        {
            // to be overrideen
            //this.model = dataStore...
        },
        initialiseSectionsStack:function()
        {
            this.sectionsStack.push({
                view:new PrimarySectionView({
                    isOpen:true,
                    restrictHeightToScreen:false,
                    showHeader:false,
                    model:dataStore.get('tree')
                }),
                class:"primary-dual",
                ordinal: 1
            });
            this.sectionsStack.push({
                view:new SecondarySectionView({
                    isOpen:false,
                    restrictHeightToScreen:true
                }),
                class:"secondary-dual",
                ordinal: 2
            });
        },

        events:{
           //
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

        onSectionItemSelected: function(item, index)
        {
            if(index === 0){
                var itemModel = dataStore.get('tree').getTreeItem(Number(item));
                this.sectionsStack[1].view.updateModel(itemModel);
            }
        }

    });
    return DualFocusSectionsStackView;
});
