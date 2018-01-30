module.exports = {
    dynamic: {
        files: [{
                expand: true,
                cwd: 'development/img',
                src: ['**/*.{png,jpg,gif,svg}'],
                dest: 'build'
            }]
    },
    example:{
        files:[{
                expand: true,
                cwd: 'development',
                src: ['img/**/*.{png,jpg,gif,svg}', 'imgs/**/*.{png,jpg,gif,svg}','example/img/**/*.{png,jpg,gif,svg}'],
                dest: 'build'
        }]
    }
};