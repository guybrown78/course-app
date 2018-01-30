define([
    'dataStore',
    'js/views/sectionsStack/section/BaseSectionView',
    'text!js/views/sectionsStack/examples/sections/SecondarySection.html',
  
], function(dataStore, BaseSectionView, SecondarySectionTemplate) {

    var SecondarySectionView = BaseSectionView.extend({
        name:"Secondary Section",
        title:"Section title",
        nullModelMessage:"There is currently no item selected",
        //
        initialize: function(options) {
            BaseSectionView.prototype.initialize.apply(this, [options]);
        },

        events:
        {
            "change form":"onFormChange",
        },
        
        renderSectionsContent:function()
        {
            var contentTemplate = _.template(SecondarySectionTemplate);
            if(this.model !== null){
                this.contentEL.html(contentTemplate(this.model.toJSON()));
            }else{
                this.contentEL.html(this.getNoDataMessageHTML(this.nullModelMessage));
            }
        },
        onFormChange:function(event){
            this.model.set('genericCount', Number($(this.el).find('form > input').val()));
        }

    });
    return SecondarySectionView;
});
