define([
    'jquery',
    'backbone',
    'js/data/requestFactory',
  //  'js/data/models/login/LoginModel',
    'js/data/models/ErrorModel',
  //  'js/data/models/user/UserSessionModel',
    'js/data/models/helpers/DeviceDetection',
    'js/data/models/helpers/ScreenSizeDetection'

], function($, Backbone, requestFactory, /*LoginModel,*/ ErrorModel, /*UserSessionModel,*/ DeviceDetection, ScreenSizeDetection) {

    var dataStoreModel = Backbone.Model.extend({
        hasCheckedLocalStorage:false,
        isLoading: true,
        login:null,
        dataError:null,       
       // userSession:null,
        deviceDetection:null,
        screenSizeDetection:null,

        parentRoute:null,
        isLoginPage:false,
        filestoreViewPreference:'grid',
        initialSetUpLoadComplete:false,
        
        initialize: function() {
            this.set('dataError', new ErrorModel());
           // this.set('userSession', new UserSessionModel);
           // this.set('login', new LoginModel());
            // initialise global helpers
            // screen sizes and device detection
            this.set('deviceDetection', new DeviceDetection());
            this.set('screenSizeDetection', new ScreenSizeDetection());
            this.get('deviceDetection').listenTo(this.get('screenSizeDetection'), 'change:stageWidth', this.get('deviceDetection').setScreenSize, this.get('screenSizeDetection'));
            //
         //   this.listenTo(this.get('userSession').get('user'), 'change:currentCentreId', this.onCentreChange);
            // initialise sharing sessionStorage between tabs using localStorage events
            // listen for localStorage changes
            $(window).on('storage', _.bind(this.onStorageChange, this));
            // Add and then immediatly remove a new TEMPORARY date element into the 
            // localStorage to trigger the localStorage change event
            window.localStorage.setItem('getSessionStorageValue', Date.now());
            window.localStorage.removeItem('getSessionStorageValue');
            // If the current window/tab is the first/initital window/tab of the 
            // application,  (ie if APP has just been launched), 
            // then there is no change of localstorage to catch. 
            // Therefore, the router 'execute' function will never be called 
            // and the application will fail to render it's first view.
            // To workaround this, give the localstorage a moment to initialise 
            // itself and then trigger the event handler manually
            setTimeout(this.onStorageInitialisedTimeout, 250);
            //
            requestFactory.setUpCORS();
            this.initAjaxErrorHandler();
        },
        
        onStorageInitialisedTimeout:function(event){
            /* Some browsers don't support the storage event, and most of the 
             browsers that do support it will only call it when the storage is 
             changed by a different window.
             
             To get around this, we manually trigger the even handle so the 
             router can move on. This is only done if hasCheckedLocalStorage
             hasn't already been flagged.
             */
            if(!this.hasCheckedLocalStorage){
                $(window).trigger('storage');
            }
        },
        onStorageChange:function(event)
        {
            if(!event.originalEvent)
            {
                //console.log("caught the blank event");
            }
            else if(event.originalEvent.key === 'setSessionStorageValue')
            {
                window.localStorage.setItem('getSessionStorageValue', Date.now());
                window.localStorage.removeItem('getSessionStorageValue');
            }
            else if(event.originalEvent.key === 'getSessionStorageValue')
            {
                window.localStorage.setItem('sessionValues', JSON.stringify(window.sessionStorage));
                window.localStorage.removeItem('sessionValues');
            }
            else if(event.originalEvent.key === 'sessionValues' && event.originalEvent.newValue !== null)
            {
                var sessionValues = JSON.parse(event.originalEvent.newValue);
                for (key in sessionValues)
                {
                    window.sessionStorage.setItem(key, sessionValues[key]);
                }
                this.get('login').getSavedTokenValues();
            }
            else if(event.originalEvent.key === 'logout')
            {
                this.get('login').revokeAuthorization();
                this.initiateLogout();
            }
            else if(event.originalEvent.key === 'timeout')
            {
                this.revokeUser();
            }
            // set the hasCheckedLocalStorage flag and trigger store:storageInitialised
            // event. store:storageInitialised is possibly listened to in the router
            this.hasCheckedLocalStorage = true;
            this.trigger('store:storageInitialised');
        },
        
        initialiseCredentials:function()
        {
            window.localStorage.setItem('setSessionStorageValue', Date.now());
            window.localStorage.removeItem('setSessionStorageValue');
        },
        
        loadInSequence: function(queue, model)
        {
            // load next item in queue
            if (queue.length)
            {
                // if queue contains items, remove first item load and load it
                model = queue.shift();
                //console.log(model);
                if (model !== null)
                {
                    // check if data requested is already loaded
                    // base model always returns false, override this in any models where you don't want to load
                    if (!model.getIsAlreadyLoaded())
                    {
                        // if not loaded then load
                        var that = this,
                            loadOptions = this.getBasicLoadOptions();
                        loadOptions.success = _.bind(this.loadSuccess, that, queue, model);
                        // fetch item
                        this.loadStart();
                        model.load(loadOptions);
                    }
                    else
                    {
                        // if model already loaded then call init method if present
                        if (_(model.init).isFunction())
                            model.init();
                        // if alread loaded load next item in queue
                        this.loadSuccess(queue, model);
                    }
                }
                else
                {
                    // model not found - cancel load and throw error
                    this.isLoading = false;
                    throw new Error("DataStore.loadInSequence(): model not found");
                }
            }
            else
            {
                // if queue empty then trigger update event in indicate loading is finished
                this.isLoading = false;
                this.loadSequenceComplete(model);
            }
        },
        getBasicLoadOptions:function(){
            var loadOptions = {
                headers: requestFactory.getHeaders(),
                timeout: 300000
            };
            return loadOptions;
        },
        loadStart: function() {
            // trigger update event
            this.isLoading = true;
            this.trigger('store:loadStart');
        },
        
        loadSuccess: function(queue, model)
        {
            //console.log("model type "+model.type);
            this.loadInSequence(queue, model);
        },
        
        loadSequenceComplete: function(model) {
            // trigger update event 
            this.isLoading = false;
            /*if(model.type === 'userSession')
            {
                this.trigger('user:loadSuccess');
            }*/
            var event = 'store:';
            /*if (this.loadEvent)
            {
                event += this.loadEvent;
                this.loadEvent = null;
                this.trigger(event,{model:model});
            }
            else
            {*/
                event += 'update';
                this.trigger(event);
            /*}*/
        },
                
        loadData: function(queue, event)
        {
            // prevent multiple requests
            /*if(this.get('login').checkLoginIsRequired())
            {
                //console.log("IS THIS VIA DATASTORE");
                window.location = "../login/index.html#login";
            }*/
            /*else if (!this.isLoading)
            {*/
                this.loadEvent = event;
                /*var hasLogin = _.findWhere(queue, {"type":"login"});
                if(!hasLogin && this.get('login').checkRefreshRequired())
                {
                    queue.unshift(this.get('login'));
                }*/
                this.loadInSequence(queue);
           /* }*/
        },
        
        checkUserLoad:function(queue)
        {
            
            /*
            if(!this.get('userSession').getIsAlreadyLoaded())
            {
                queue.unshift(this.get('userSession'));
            }
            */
        },
        
        loadError: function(error) {
            this.isLoading = false;
            this.get('dataError').clear();
            this.get('dataError').set(error);
            /*
            * On a 400 login error, the page should display a popup
            * This should allow the user to log in again at the page they are currently at
            * This is handled in the base page view, but may be called from any 400 error
            * Whether this is local or global
            * So an event is dispatched to handle this in the page
            * Even if the call is not a page call
            */ 
            /*if(error.errorAction === 'timeoutUser' && !this.isLoginPage)
            {
                console.log('trigger login error');
                this.trigger('error:login');
            }
            else
            {*/
                this.trigger("store:error");
            /*}*/
        },
        
        onCentreChange:function(event)
        {
            //requestFactory.setCurrentCentre(this.get('userSession').get('user').get('currentCentreId'));
        },
        
        
        initAjaxErrorHandler: function() {
            var that = this;
            $(document).ajaxError(function(event, jqXHR, settings, exception) {
               /* if (that.get('login').isLogout)
                {
                    //if an error occurs in the logging out process
                    //it should handle as if the call was successful
                    //by removing the token and returning the user to the login page
                    //the user is still logged out as they do not have credentials to access the services
                    that.loadSequenceComplete(that.get('login'));
                }
                else
                {*/
                    that.loadError(that.getStatusError(jqXHR, exception));
               /* }*/
            });
        },
        
        getStatusError:function(jqXHR, exception)
        {
            var statusError = {};
            if (!jqXHR.status || jqXHR.status === null)
            {
               //If no status is returned, then the error is not from the server
               //e.g.for an aborted request, or a network failure
               console.log("non http status error")
               statusError = this.getNonHTTPStatusError(exception);
            }
            else
            {
                var attributes = jqXHR.responseJSON,
                    isServerResponse = (attributes && attributes !== null && ((attributes.code && attributes.code > 0) || (jqXHR.status === 400 && attributes.error_description)))
                if (isServerResponse)
                {
                    //If the response returned from the server is valid JSON 
                    //then error model attributes are created from the server response
                    statusError = this.populateServerErrorMessage(jqXHR.status, jqXHR.statusText, attributes);
                }
                else
                {
                    //If no responseJSON is returned, and data Content-Type from the server is not JSON 
                    //or the server response does not bring back the expected data
                    //then error model attributes are created manually
                    statusError = this.populateLocalErrorMessage(jqXHR.status, jqXHR.statusText, attributes)
                }
            }
            return statusError;        
        },
        
        populateServerErrorMessage:function(status, statusText, serverError)
        {
            var errorObject = {};
            errorObject.status = status;
            errorObject.statusText = statusText;
            if(status === 400)
            {
                errorObject.code = status;
                errorObject.displayTitle = serverError.error;
                errorObject.displayMessage = serverError.error_description;
            }
            else
            {
                errorObject.displayMessage = serverError.displayMessage;
                errorObject.displayTitle = serverError.displayTitle;
                errorObject.code = serverError.code;
                errorObject.errors = serverError.errors;
            }
            if(status === 400 || status === 401)
            {
                errorObject.errorAction = "timeoutUser";
            }
            else if(status === 403)
            {
                errorObject.errorAction = "userWithoutCredentials";
            }
            return errorObject;
        },
        
        populateLocalErrorMessage:function(status, statusText, localError)
        {
            var errorObject = {};
            errorObject.status = status;
            errorObject.statusText = statusText;
            errorObject.code = status;
            switch (status)
            {
                case 0:
                    return this.getNonHTTPStatusError("timeout");
                    break;
                case 400:
                    errorObject.code = 400;
                    errorObject.displayMessage = "An error has occured with the login";
                    errorObject.displayTitle = statusText;
                    errorObject.errorAction = "timeoutUser";
                    break;
                case 401:
                    errorObject.displayMessage = "Unauthorised response";
                    errorObject.displayTitle = "Not a valid login";
                    // User not authorised or hasn't got the correct credentials - therefore not authorise 
                    //errorProperties.errorAction = "revokeUser";
                    /////*******TEMPORARY********///////
                    //Set as a timeout as this error is being returned from WebAPI if user token invalid
                    errorObject.errorAction = "timeoutUser";
                    break;
                case 403: // unauthorised?
                    errorObject.displayMessage = "You are not authorised to view this page";
                    errorObject.displayTitle = "Invalid credentials";
                    // 403 is a user trying to access a route/call that they don't have access to view
                    errorObject.errorAction = "userWithoutCredentials";
                    break;
                default:
                    console.log("500 - 404 - 406 - 422");
                    errorObject.displayMessage = statusText;
                    errorObject.displayTitle = "An error has occured";
                    errorObject.status = status;
                    errorObject.statusText = statusText;
                    break;
            }
            return errorObject;
        },
        
        getNonHTTPStatusError: function(exception)
        {
            var displayMessage = "This page is currently unavailable.",
                displayTitle = "An unknown error has occured",
                statusText = exception,
                status = 0;
            switch (exception)
            {
                case 'parsererror':
                    displayTitle = "Error: Unexpected data.";
                    displayMessage = "The data cannot be read";
                    break;
                case 'timeout':
                    displayTitle = "The data call has timed out, please try again";
                    break;
                case 'abort':
                    displayTitle = "The data call has aborted, please try again";
                    break;
                case 'error':
                    displayTitle = "The data call has failed, this may be due to a lost connection. Please check your network or wifi settings and try again";
                    break;
                default:
                    break;
            }
            return {status: status, displayMessage: displayMessage, displayTitle: displayTitle, statusText: statusText, code:status};
        },
        
        getCustomDataError:function(jqXHR, exception)
        {
            var error = this.getStatusError(jqXHR, exception);
            if(error.status === 400 || error.status === 401 || error.status === 403)
            {
                //console.log("is a timeout or unauthorised");
                this.loadError(error);
            }
            return new ErrorModel(error, {parse:true});
        },
                           
        
        initiateLogout:function()
        {
            window.location = "../login/index.html#/logout";
        },
        
        dataLogout:function()
        {
            this.clearUser();
            this.get('login').isLogout = false;
            this.get('login').resetDefaults();
            this.get('login').revokeAuthorization();
        },
        
        
        /***
         * Reset user object on logout
         ***/
        clearUser:function()
        {
            //this.set('user',null);
            this.set('userId', null);
            //this.set('user', new UserModel());
            this.set('userSession',null);
            this.set('userSession', new UserSessionModel());
           // this.set('user', this.get('userSession').get('user'));
        },
        
        revokeUser:function()
        {
            //console.log("revoke user");
            this.clearUser();
            this.get('login').revokeAuthorization();
            this.trigger('store:revokeUser');
            window.location = "../login/index.html#/login";
        },
        
        
        returnToDefaultPage:function()
        {
            window.location = "../login/index.html#/selectRole";
        },
        
        handleErrorAction:function(statusError)
        {
            switch(statusError.get('errorAction')){
                case "timeoutUser":
                    window.localStorage.setItem('timeout', Date.now());
                    window.localStorage.removeItem('timeout');
                    this.revokeUser();
                    break;
                case "revokeUser":
                    this.revokeUser();
                    break;
                case "userWithoutCredentials":
                    this.returnToDefaultPage();
                    break;
                default:
                    //
                    break;
            }
        }

    });
    return dataStoreModel;
});
