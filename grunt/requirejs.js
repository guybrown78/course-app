module.exports = {
    example: {
        options: {
            name: 'example/exampleMain',
            baseUrl: 'development',
            mainConfigFile: 'development/example/exampleMain.js',
            optimize: "uglify2",
            preserveLicenseComments: false,
            generateSourceMaps: true,
            exclude: ['externalLibraries/backbone/backbone-min.js', 'externalLibraries/backbone/backbone-validation-amd-min.js', 'externalLibraries/underscore/underscore-min.js', 'externalLibraries/jquery/jquery-1.12.3.min.js', 'externalLibraries/require/require.js', 'externalLibraries/require/text.js', 'externalLibraries/spin/spin.min.js'],
            out: 'build/example/js/exampleMain.js'
        }
    }
};
