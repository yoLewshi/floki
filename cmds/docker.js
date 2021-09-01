const shell = require("shelljs");
const ora = require("ora");
const config = require("../config.js");

var docker = (function() {
  const containers = config.docker.containers;

  var pause = function() {
    const spinner = ora("pausing containers").start();

    const proms = containers.map(container => {
      return new Promise(resolve => {
        shell.exec(
          `docker pause ${container}`,
          {
            silent: true,
            async: true
          },
          resolve
        );
      }).then((id, stdout, stderr) => {
        spinner.text = container;
        if (stderr) {
          console.error(stderr);
        }
      });
    });

    return Promise.all(proms).then(() => {
      spinner.succeed("containers paused");
      process.exit(0);
    });
  };

  var resume = function() {
    const spinner = ora("resuming containers").start();

    const proms = containers.map(container => {
      return new Promise(resolve => {
        shell.exec(
          `docker unpause ${container}`,
          {
            silent: true,
            async: true
          },
          resolve
        );
      }).then((id, stdout, stderr) => {
        spinner.text = container;
        if (stderr) {
          console.error(stderr);
        }
      });
    });

    return Promise.all(proms).then(() => {
      spinner.succeed("containers resumed");
      process.exit(0);
    });
  };

  var stop = function() {
    const spinner = ora("stopping containers").start();

    const proms = containers.map(container => {
      return new Promise(resolve => {
        shell.exec(
          `docker stop ${container}`,
          {
            silent: true,
            async: true
          },
          resolve
        );
      }).then((id, stdout, stderr) => {
        spinner.text = container;
        if (stderr) {
          console.error(stderr);
        }
      });
    });

    return Promise.all(proms).then(() => {
      spinner.succeed("containers stopped");
      process.exit(0);
    });
  };

  var start = function() {
    const spinner = ora("starting containers").start();

    const proms = containers.map(container => {
      return new Promise(resolve => {
        shell.exec(
          `docker start ${container}`,
          {
            silent: true,
            async: true
          },
          resolve
        );
      }).then((id, stdout, stderr) => {
        spinner.text = container;
        if (stderr) {
          console.error(stderr);
        }
      });
    });

    return Promise.all(proms).then(() => {
      spinner.succeed("containers started");
      process.exit(0);
    });
  };

  return {
    pause: pause,
    resume: resume,
    stop: stop,
    start: start
  };
})();

module.exports = docker;
