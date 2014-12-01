Package.describe({
  name: 'bitly',
  summary: 'Bitly package',
  version: '1.0.0'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.addFiles('bitly.js', 'server');
  api.export('Bitly');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('bitly');
  api.addFiles('bitly-tests.js');
});
