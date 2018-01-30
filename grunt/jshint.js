module.exports = {
    equal: {
        options: {
            '-W058': true,
            globals: {
                jQuery: true,
                console: true,
                module: true,
                document: true
            }
        },
        files: {
            src: ['development/js/**/*.js']
        }
    },
   
    example: {
        options: {
            '-W058': true,
            globals: {
                jQuery: true,
                console: true,
                module: true,
                document: true
            }
        },
        files: {
            src: ['development/example/js/**/*.js']
        }
    }
};