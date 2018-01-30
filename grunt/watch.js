module.exports = {
    css: {
        files: '**/*.scss',
        tasks: ['sassPortfolio'],
    },
    livereload: {
        // Here we watch the files the sass task will compile to
        // These files are sent to the live reload server after sass compiles to them
        options: {livereload: true},
        files: ['build/**/*']
    }
};