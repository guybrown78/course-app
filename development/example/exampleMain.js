// This bootstrap file will be responsible for configuring Require.js and loading initially important dependencies.

// Require.js allows us to configure shortcut alias
// create shortcut alias' to jQuery, Underscore and Backbone
// these are non - AMD

require.config({
    baseUrl:"../",
    
    paths: {
        dataStore:'example/js/data/ExampleDataStore',
        jquery: 'externalLibraries/jquery/jquery-1.12.3.min',
        underscore: 'externalLibraries/underscore/underscore-min',
        backbone: 'externalLibraries/backbone/backbone-min',
        text: 'externalLibraries/require/text',
        spinner: 'externalLibraries/spin/spin.min'
    }
});

require([
    // Load our app module and pass it to our definition function (does not need '.js' as is added automatically)
    'example/exampleApp'

            // Some plugins have to be loaded in order due to their non AMD compliance
            // Because these scripts are not "modules" they do not pass any values to the definition function below
], function(App) {
    // The "app" dependency is passed in as "App"
    // Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function
    App.initialize();
});
