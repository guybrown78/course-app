define([

    'js/router',
    'dataStore',
    'js/views/sectionsStack/examples/DualFocusStackPageView',
    'js/views/sectionsStack/examples/SliderStackPageView',
    'js/views/courses/CoursesPageView'
    
], function(
        Router, 
        dataStore, 
        DualFocusStackPageView, 
        SliderStackPageView,
        CoursesPageView
    ) {

    var exampleRouter = Router.extend({
        routes: {
            // Define URL routes
            'myCourses':'showPage',
            'courses':'showPage',
            'dualFocusStack':'showSectionsStackPage',
            'sliderStack':'showSectionsStackPage',
            'error':'showError',
            // Default
            '*actions': 'defaultView'
        },
        switchableViews:[
            'DualFocusStackPageView',
            'SliderStackPageView',
            'CoursesPageView'
        ],
        initialize: function() {
            Router.prototype.initialize.apply(this);
        },
        
        showPage:function(){
            var path = window.location.href,
                selectedPageIdentifier = path.substr(path.lastIndexOf('#') + 1),
                newView = "";
            switch(selectedPageIdentifier)
            {
                case 'myCourses':
                    newView = CoursesPageView
                    break;
                case 'courses':
                    newView = CoursesPageView
                    break;
            }
            this.switchView(newView, null, true);
        },     
        showSectionsStackPage:function(){
            var path = window.location.href,
                selectedPageIdentifier = path.substr(path.lastIndexOf('#') + 1),
                newView = "";
            switch(selectedPageIdentifier)
            {
                case 'dualFocusStack':
                    newView = DualFocusStackPageView
                    break;
                case 'sliderStack':
                    newView = SliderStackPageView
                    break;
            }
            this.switchView(newView, null, true);
        },     
        showError:function(){
            //console.log("Error");
            //this.switchView(Error);
        },
        switchView: function(view, viewType, showHeader)
        {
            /*if(!showHeader){
                this.headerView.hide();
            }else{
                this.headerView.show();
            }*/
            Router.prototype.switchView.apply(this,[view,viewType]);
        },   
        defaultView: function() {
            window.location.hash = "courses";
        }
        
    });
    
    var initialize = function() {
        var router = new exampleRouter;
        Backbone.history.start();
    };
    
    return {
        initialize: initialize
    };
});
