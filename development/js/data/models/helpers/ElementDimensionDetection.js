define([
    'js/data/models/BaseModel'

], function(BaseModel) {

    var elementDimensionDetectionModel = BaseModel.extend({
        type:"ElementDimensionDetection",
        defaults: {
            el:null,
            heightListener:false,
            widthListener:false,
            //
            elWidth:null,
            elHeight:null,
            //
            listenerRunSpeed:250
        },
        initialize: function() 
        {
            BaseModel.prototype.initialize.apply(this);
            /*if (options.el !== undefined) 
            {
                this.set('el', options.el);
            }else{
                this.set('el', document.body);
            }*/
            //console.log("Initialised " + this.get('el'));
            if(this.get('el') !== null && this.get('heightListener'))
                this.onElementHeightChange(this.get('el'), this.onElementHeightResize, this);
            //console.log(this.get('el'))
            
        },
        
        onElementHeightChange: function(el, callback, ref){
            //console.log("Boom " + el  + " ::  " + callback);
            var lastHeight = el.clientHeight, runSpeed = this.get('listenerRunSpeed'), newHeight;
            (function run(){
                
                newHeight = el.clientHeight;
                //console.log("run: " + lastHeight + " v's " + newHeight);
                if( lastHeight !== newHeight )
                    callback(ref);
                lastHeight = newHeight;
                
                if( el.onElementHeightChangeTimer )
                    clearTimeout(el.onElementHeightChangeTimer);

                el.onElementHeightChangeTimer = setTimeout(run, runSpeed);
            })();
        },
        onElementHeightResize: function(that)
        {
            that.set('elHeight', that.get('el').clientHeight); 
           // console.log("Element height change " + that.get('elHeight'));
            //that.trigger('elementResize:height');
        },
        destroy: function()
        {
            if(this.get('el') !== null){
                if( this.get('el').onElementHeightChangeTimer )
                    clearTimeout(this.get('el').onElementHeightChangeTimer);
            }
            BaseModel.prototype.destroy.apply(this);
        }
        
    });
    return elementDimensionDetectionModel;
});
