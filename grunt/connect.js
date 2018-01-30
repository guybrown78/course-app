module.exports = {
    global:{
        options:{
            base:'development',
            hostname:'localhost',
            keepalive:true,
            /*protocol: 'https', // or 'http2'
            port: 8443,
            key: grunt.file.read('server.key').toString(),
            cert: grunt.file.read('server.crt').toString(),
            ca: grunt.file.read('ca.crt').toString()*/
            open:{
                target: 'http://localhost:8000/example/index.html',
                appName: 'Chrome'
            }
        }
    },
    
    example:{
        options:{
            base:'development',
            hostname:'localhost',
            keepalive:true,
            open:{
                target: 'http://localhost:8000/example/index.html',
                appName: 'Chrome'
            }
        }
    }
   
    
};
