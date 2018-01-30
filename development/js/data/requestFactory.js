define([
    'jquery',
    'backbone'

], function($, Backbone) {

    function requestFactory()
    {
        /**
         * @class RequestFactory staic class containing helper funcs for models / collections
         */
        this.isLocal = false;
        this.apiVersion = "1";
        this.token = null;
        this.centreId = null;
        this.developmentServicePrefix = ".../api/";
        this.servicePrefix = "...";
        this.loginPrefix = ".../connect/";
        this.validationRules = null;

        // UAT Environment settings for local hosting of web services
        // this.developmentServicePrefix = ".../api/";
        // this.servicePrefix = ".../api/";
        // this.loginPrefix = ".../api/connect/";

        // Environment settings for local hosting of web services
        // this.developmentServicePrefix = "https://localhost:44394/api/";
        // this.servicePrefix = "https://localhost:44394/api/";
        // this.loginPrefix = "https://localhost:44394/connect/";

        this.localServicePrefix = "../testjson/";

        /**
         * Returns request headers
         *
         * @returns {Object} request headers
         */
        this.getHeaders = function()
        {
            if (this.isLocal || this.isNotAuth)
                return {}
            return {
                'Authorization':window.sessionStorage.getItem('token_type')+' '+window.sessionStorage.getItem('access_token'),
                'Content-Type':'application/json'/*,
                'Accept':'application/json'*/
                //'Access-Control-Allow-Origin': '...',
                //'contentType': 'application/json; charset=UTF-8',
                //contentType: "application/x-www-form-urlencoded; charset=UTF-8"
                //'dataType': 'json'};
                //'X-Api-Version': this.apiVersion
                //'dataType': "json"
                //processData: false
            }
        };

        this.getLoginHeaders = function()
        {
            return {
                // Authorization Should be APP if using an actual access token,
                // or APPWeb if using a GUID to the access token in the db
                //'Authorization': "Basic " + btoa("APP"+ ":" + "0C3404DC-C574-46C4-82DF-2B2A8922548E"),
                'Authorization': "Basic " + btoa("APPWeb"+ ":" + "0C3404DC-C574-46C4-82DF-2B2A8922548E"),
                'Accept':'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
                //'Access-Control-Allow-Origin': 'http://...',
                //'contentType': 'application/json; charset=UTF-8',
                //contentType: "application/x-www-form-urlencoded; charset=UTF-8"
                //'dataType': 'json'};
                //'X-Api-Version': this.apiVersion
                //'dataType': "json"
                //processData: false
            }
        };
        /**
         * Returns correct service prefix
         *
         * @param {String} isLocalOverride allows individual service to be loaded locally
         * @returns {String} service prefix
         */
        this.getServicePrefix = function(languageSpecific)
        {
            languageSpecific = (typeof languageSpecific !== 'undefined') ? languageSpecific : true;
            if (this.isLocal)
            {
                return this.localServicePrefix;
            }
            if(!languageSpecific)
            {
                return this.developmentServicePrefix;
            }
            return this.developmentServicePrefix+"en-GB/";
        };

        /**
         * Serializes object containing request params into string
         *
         * @param {Object} requestParams object describing request parameters
         * @returns {String} string of serialized params
         */
        this.getSerializedParams = function(requestParams, isLocalOverride)
        {
            if (this.isLocal || isLocalOverride)
                return this.buildLocalFileRequestString(requestParams) + ".json";
            return this.buildQueryString(requestParams);
        };

        /**
         * Serializes object containing request params into query string
         *
         * @param {Object} requestParams object describing request parameters
         * @returns {String} string of serialized params
         */
        this.buildQueryString = function(requestParams)
        {
            var requestParams_str = "?";
            for (var key in requestParams)
            {
                requestParams_str += key + "=" + requestParams[key];
                requestParams_str += "&";
            }
            if (this.token != null)
            {
                requestParams_str += "token=" + this.token;
            }
            else
            {
                // remove trailing '&'
                requestParams_str = requestParams_str.substring(0, requestParams_str.length - 1);
            }
            //requestParams_str += "&r=" + new Date().getTime();
            return requestParams_str;
        };

        /**
         * Serializes object containing request params into local file reference string
         *
         * @param {Object} requestParams object describing request parameters
         * @returns {String} string of serialized params
         */
        this.buildLocalFileRequestString = function(requestParams)
        {
            var requestParams_str = "/&";
            for (var key in requestParams)
            {
                var abreviatedName = this.createLocalParamName(key);
                requestParams_str += abreviatedName + "=" + requestParams[key];
                requestParams_str += "&";
            }
            requestParams_str = requestParams_str.substring(0, requestParams_str.length - 1);
            if (this.token != null)
            {
                requestParams_str += "&to=" + this.token;
            }
            return requestParams_str;
        };

        this.getPreventCacheString = function(dateUnique)
        {
            if (this.isLocal)
                return "";
            var today = new Date(),
                dStr = today.getTime();
            if (dateUnique)
                // return same number for every request made per day
                dStr = new Date(today.getFullYear(), today.getMonth(), today.getDay()).getTime();
            return dStr;
        };

        this.getPreventCacheQueryString = function(dateUnique)
        {
            return "&pc=" + this.getPreventCacheString(dateUnique);
        };

        this.setToken = function(updateToken)
        {
            this.token = updateToken;
            //window.localStorage.setItem("persistLogon", this.token);
        };

        this.setCurrentCentre = function(cId)
        {
            this.centreId = cId
        };

        this.getCurrentCentre = function()
        {
            return this.centreId;
        };
        this.getCentreQueryParam = function(roleId)
        {
            switch (roleId){
                case 10:
                    return this.getCurrentCentre();
                    break;
            }
            return null;
        };
        this.createLocalParamName = function(param)
        {
            var l = param.length;
            if(l < 8)
                return param;
            return param.substring(0, 8);
        };

        /*
         * Override Backbone.sync to enable Cross Origin Requests
         */
        this.setUpCORS = function() {
            // only set up cors if connecting to remote data source
            if (this.isLocal === false)
            {
                $.support.cors = true;
                var proxiedSync = Backbone.sync;
                Backbone.sync = function(method, model, options) {
                    options || (options = {
                    });
                    if (model.isLocal !== true)
                    {
                        if (!options.crossDomain)
                        {
                            options.crossDomain = true;
                        }
                        /*if (!options.xhrFields)
                        {
                            options.xhrFields = {
                                withCredentials: true
                            };
                        }*/
                    }
                    return proxiedSync(method, model, options);
                };
            }
        };
    }
    return new requestFactory;
});
