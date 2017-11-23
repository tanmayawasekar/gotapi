// gulpfile.js (task runner to run environment specific tasks)
const gulp = require('gulp');
const run = require('run-sequence');
const watch = require('gulp-watch');
const pm2 = require('pm2');

// Other variables
const paths = {
  "js": "./**/*.js"
};

// Development Task Runner
gulp.task('default', cb => {
  run('build', 'watch', cb); //Runs 'build', 'watch' task in sequence
});

// To build the server
gulp.task('build', cb => {
  run('server', cb);
});

// To watch the server
gulp.task('watch', cb => {
  return watch(paths.js, () => {
    gulp.start('restart-server'); // In case of breakdown restart
  });
});

//Starts a new server instance
gulp.task('server', () => {

  /*
  	- All About PM2 Configuration file - http://pm2.keymetrics.io/docs/usage/application-declaration
  	- All the available options that can be added to PM2 config file - http://pm2.keymetrics.io/docs/usage/application-declaration/#list-of-attributes-available
  */

  //Base Configuration [irrespective of the environment]
  let pm2Config = {
    'name': 'gotbattle',
    'script': './index.js'
  };

  //Environment specific configuration
  pm2Config['exec_mode'] = 'fork';
  // pm2Config['instances'] = 0; // number of instances for your clustered app, 0 means as much instances as you have CPU cores. a negative value means CPU cores - value (e.g -1 on a 4 cores machine will spawn 3 instances)
  pm2Config['max_memory_restart'] = '250M'; // your app will be restarted by PM2 if it exceeds the amount of memory specified. human-friendly format : it can be “10M”, “100K”, “2G” and so on…

  pm2.connect(true, function (err) {
    if (err) {
      console.error(err);
      process.exit(2);
    }

    pm2.start(pm2Config, function (error, apps) {
      pm2.connect(true, function (pm2Err) {
        if (pm2Err) {
          console.error(pm2Err);
          process.exit(2);
        }
        pm2.list();
        pm2.streamLogs('all', 0);
      });
      pm2.disconnect();
    });
  });
});
// Restarting the server
gulp.task('restart-server', () => {

  pm2.connect(true, function (err) {
    if (err) {
      console.error(err);
      process.exit(2);
    }
    pm2.streamLogs('all', 0);
    pm2.restart('all', function (error, proc) {
      pm2.list();
      pm2.disconnect();
    });
  });
});
