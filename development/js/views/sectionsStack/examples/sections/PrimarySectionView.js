define([
    'dataStore',
    'js/views/sectionsStack/section/BaseSectionView',
    'js/views/tree/TreeView',
    'text!js/views/sectionsStack/examples/sections/PrimarySection.html'
  
], function(dataStore, BaseSectionView, TreeView, PrimarySectionTemplate) {

    var PrimarySectionView = BaseSectionView.extend({
        name:"PrimarySection",
        title:"Section title",
        nullModelMessage:"There is currently no item selected",
        treeView:null,
        //
        initialize: function(options) {
            BaseSectionView.prototype.initialize.apply(this, [options]);
        },
        
        events:
        {
            'click .tree-node-item .active-select-area':'onItemSelected'
        },
    
        requestData:function()
        {
            var queue = [];
            this.model.loadParams = {
                loadType:"getTreeRoot",
                itemId:0
            };
            queue.push(this.model);
            BaseSectionView.prototype.requestData.apply(this, [queue]);
        },
        renderSectionsContent:function()
        {
            var contentTemplate = _.template(PrimarySectionTemplate);
            this.contentEL.html(contentTemplate({}));
            this.initialiseTreeView();
        },
        initialiseTreeView:function()
        {    
            this.treeView = new TreeView({
                el:$(this.el).find('.tree-container'),
                model:this.model,
                openCloseNodeItem:false,
                openCloseArrowOnly:true,
                //nodeItemTemplate:ViewSpecificTreeNodeItem,
                getChildrenLoadParams:{
                    loadType:"getChildren"
                },
                additionalModelListenersHandlers:[
                    {listener:'change:genericCount', handler:this.onTreeViewGenericCountChange}
                ]
            });
            this.treeView.render();
        },
        onItemSelected:function(event){
            var item = $(event.currentTarget).closest('.tree-node-item');
            this.trigger('sectionStackView:itemSelect', item.attr('data-id'), this.index);
        },
        onTreeViewGenericCountChange:function(model, value){
            var selectorQuery = '[data-id="' + model.get('itemId') + '"]';
            $(selectorQuery).find('.cel-generic-count').html(model.get('genericCount'));
        },
        setAdditionalViewItemHeights: function(contentHeight){
            this.contentEL.css('min-height', contentHeight)
        }

    });
    return PrimarySectionView;
});
