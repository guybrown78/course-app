define([
    'jquery',
    'underscore',
    'backbone',
    'dataStore'

], function($, _, Backbone, dataStore) {
    var BaseRouter = Backbone.Router.extend({
       currentView: null,

       /**
         * Override default Router.route method to all args to be passed to methods in routes
         * @param {String} modelId e.g. "qualification"
         *
         */ 
              
        initialize: function() {
           // this.initialiseHeaderView();
            // remover 'initialising-application-wrapper' selector from body
           // document.body.className = document.body.className.replace("initialising-application-wrapper","");
        },
        execute: function(callback, args, name) {
            // catch the execute function which is used in backbone's router to 
            // execute a view. 
            // Before a view is executed check the datastore flag 'hasCheckedLocalStorage'
            if (!dataStore.hasCheckedLocalStorage) {
                // If it hasn't been set, then the router must wait until 
                // the application has had chance to apply the session storage 
                // checks. This is done by adding a temporary listener and storing 
                // the execute functions arguments
                this.executeArgument = [callback, args, name];
                this.listenTo(dataStore, 'store:storageInitialised', this.onDataStoreInitialised, this);
                return false;
            }else{
                // The application has checked the storage, carry on.
                if (callback) callback.apply(this, args);
            }
        },
        onDataStoreInitialised: function()
        {
            // The datastore has initialised and complete it's storage checks.
            // nullify all temporary listeners and cariables and re-request the 
            // router's execute function.
            this.stopListening(dataStore, 'store:storageInitialised');
            this.execute(this.executeArgument[0], this.executeArgument[1], this.executeArgument[2]);
            this.executeArgument = null;
        },
       /* initialiseHeaderView: function() {
             //can be overriden in application router
             this.headerView = new HeaderView();
             //this.isHeaderInitialised = true;
             this.listenTo(this.headerView, 'headerview:NavigationUpdate', this.onHeaderUpdate, this);
        },*/
        /*onHeaderUpdate:function(){
            // the header navigation has re-rendered and may have altered in size.
            // therefore, inform the current PageView. Each View that extends PageView 
            // can determine a new height once it has recieved the update
            if(this.currentView !== null){
                if(typeof this.currentView.onHeaderUpdate === "function"){
                    this.currentView.onHeaderUpdate();
                }
            }
        },*/
        
        showApplicationSetup:function()
        {
            console.log("SHOW APPLICATION SETUP")
            if (this.currentView !== null)
            {
                this.currentView.destroy();
            }
            this.currentView = null;
            this.currentView = new ApplicationSetUpPageView();
            this.listenTo(dataStore, 'setUp:complete', this.onInitialSetUpComplete);
            this.currentView.render();
        },
        
        onInitialSetUpComplete:function(event)
        {
            window.location.hash = this.nextLocation;
        },
        
        switchView: function(view, viewType, viewModel, ignoreUserSessionLoad)
        {
          //  if (dataStore.initialSetUpLoadComplete || ignoreUserSessionLoad)
            //{
                // evaluate string arguments
                View = this.referenceView(view);
                if (!View)
                {
                    throw new Error("Invalid view");
                }

                if (this.currentView !== null)
                {
                    this.currentView.destroy();
                }
                this.currentView = null;
                //
                var viewInitObject = {viewType: viewType};
                if (viewModel !== null) {
                    viewInitObject.model = viewModel;
                }
                this.currentView = new View(viewInitObject);
                // reset the scroll position of the whole HTML page
                // could potentially remember the scroll position and if coming back to a previous page set the scroll - ideal for large lists where you scroll all the way down to an item and then click it to view more details, then return back to list
                document.body.scrollTop = document.documentElement.scrollTop = 0;
                this.currentView.render();
            //} 
           /* else
            {
                this.nextLocation = window.location.hash;
                window.location.hash = '/setup';
            }*/
        },
        
        /*
         * Check if view exists to ensure eval method can't be attacked with malicious JS string
         */
        viewExists: function(View)
        {
            if (typeof View === 'string' && this.switchableViews.indexOf(unescape(View)) > -1)
            {
                return true;
            }
            else
            {
                throw new Error("View not found");
                return false;
            }
        },

        parseQueryString:function(queryString){
            var params = {};
            if(queryString){
                _.each(
                    _.map(decodeURI(queryString).split(/&/g),function(el,i){
                        var aux = el.split('='), o = {};
                        if(aux.length >= 1){
                            var val = undefined;
                            if(aux.length == 2)
                                val = aux[1];
                            o[aux[0]] = val;
                        }
                        return o;
                    }),
                    function(o){
                        _.extend(params,o);
                    }
                );
            }
            return params;
        },
        referenceView: function(View)
        {
            if (typeof View === 'function')
                return View;
            if (this.viewExists(View))
                return eval(View);
            return false;
        }
    })
    return BaseRouter;
});