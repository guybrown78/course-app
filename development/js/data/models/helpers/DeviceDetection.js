define([
    'js/data/models/BaseModel'

], function(BaseModel) {

    var DeviceDetectionModel = BaseModel.extend({
        type:"DeviceDetection",
        defaults: {
            screenSize:null,
            screenSmall:"screenSmall",
            screenSmallLowestThreshold:0,
            screenSmallHighestThreshold:479,
            screenMedium:"screenMedium",
            screenMediumLowestThreshold:480,
            screenMediumHighestThreshold:959,
            screenLarge:"screenLarge",
            screenLargeLowestThreshold:960,
            screenLargeHighestThreshold:Infinity
        },
        initialize: function() 
        {
            BaseModel.prototype.initialize.apply(this);
            this.setScreenSize();
        },
        setScreenSize:function(screenSizeDetectionModel)
        {
            var stageWidth;
            if(screenSizeDetectionModel){
                stageWidth = screenSizeDetectionModel.get('stageWidth');
            }else{
                stageWidth = $(window).width();
            }
            
            if(stageWidth <= this.get('screenSmallHighestThreshold')){
                this.set('screenSize', this.get('screenSmall'));
            }else if(stageWidth >= this.get('screenMediumLowestThreshold') && stageWidth <= this.get('screenMediumHighestThreshold')){
                this.set('screenSize', this.get('screenMedium'));
            }else if(stageWidth >= this.get('screenLargeLowestThreshold')){
                this.set('screenSize', this.get('screenLarge'));
            }
        },
        getScreenSize:function()
        {
           this.setScreenSize();
           return this.get('screenSize');
        },
        isScreenSizeSmall:function()
        {
           return this.getScreenSize() === this.get('screenSmall');
        },
        isScreenSizeMedium:function()
        {
           return this.getScreenSize() === this.get('screenMedium');
        },
        isScreenSizeLarge:function()
        {
           return this.getScreenSize() === this.get('screenLarge');
        }
    });
    return DeviceDetectionModel;
});
