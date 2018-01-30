define([
    'dataStore',
    'js/views/sectionsStack/BaseSectionsStackPageView',
    'js/views/sectionsStack/examples/sections/PrimarySectionView',
    'js/views/sectionsStack/examples/sections/SecondarySectionView',
    
], function(dataStore, BaseSectionsStackPageView, PrimarySectionView, SecondarySectionView) {

    var SliderSectionsStackView = BaseSectionsStackPageView.extend({
        name:"Slider stack page view example",
        gridType:"slider", // dual-focus || slider
        currentFocusedIndex:0,
        //
        initialize: function(options)
        {
            BaseSectionsStackPageView.prototype.initialize.apply(this, [options]);
        },
 
        initialiseSectionsStack:function()
        {
            this.sectionsStack.push({
                view:new PrimarySectionView({
                    isOpen:true,
                    restrictHeightToScreen:false,
                    showHeader:false
                }),
                class:"secondary-slider",
                ordinal: 1
            });
            this.sectionsStack.push({
                view:new SecondarySectionView({
                    isOpen:false,
                    restrictHeightToScreen:true
                }),
                class:"secondary-slider",
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
                var temporaryModel = new Backbone.Model({ displayName: "Item " + item, id:item});
                this.sectionsStack[1].view.updateModel(temporaryModel);
            }
        }

    });
    return SliderSectionsStackView;
});
