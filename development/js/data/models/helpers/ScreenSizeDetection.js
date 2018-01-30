define([
    'js/data/models/BaseModel'

], function(BaseModel) {

    var ScreenSizeDetectionModel = BaseModel.extend({
        type:"ScreenSizeDetection",
        defaults: {
            stageHeight:null,
            stageWidth:null,
        },
        initialize: function() 
        {
            BaseModel.prototype.initialize.apply(this);
            $(window).on('resize', _.bind(this.onScreenResize, this));
            this.onScreenResize();
        },
        onScreenResize: function()
        {
            this.set('stageHeight', Number($(window).height())); 
            this.set('stageWidth', Number($(window).width()));
            this.trigger('screen:resize');
        }
        
    });
    return ScreenSizeDetectionModel;
});
