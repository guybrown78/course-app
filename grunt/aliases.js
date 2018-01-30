module.exports = {
  'exampleApp':[
    'requirejs:example',
    'sass:example',
    'newer:copy:externalLibraries',
    'newer:cssmin:example',
   // 'newer:imagemin:example'
  ],
  'example':[
      'exampleApp',
      'connect:example'
  ],
 
  'default': [
      'exampleApp',
      'connect:global'
  ]
};
