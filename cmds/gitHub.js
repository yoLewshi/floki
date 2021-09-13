var GitHub = require("github-api");
const shell = require("shelljs");
const ora = require("ora");
var inquirer = require("inquirer");

const systemCmds = require("./system.js");
const db = require("./db.js");

const icons = require("../img/base64.js");
const config = require("../config.js");

var gitHub = (function() {
  var gh = new GitHub({
    token: config.gitHub.token
  });

  var me = gh.getUser(); // no user specified defaults to the user for whom credentials were provided

  // used in currently broken needingReview method
  var repos = ["wegotpop/popsss"];

  var getContext = function() {
    shell.cd(config.paths.POPSSS);
  };

  var getNotifications = function() {
    return me.listNotifications().then(response => {
      // do some stuff
      var items = response.data;
      return items;
    });
  };

  var notifications = function(program) {
    return me.listNotifications().then(response => {
      var items = response.data;
      var lastRepo = "";

      if (items.length) {
        if (program.touchbar) {
          let colour = "75,75,75";
          if (items.length == 2) {
            colour = "252,191,73,255";
          } else if (items.length == 3) {
            colour = "247,127,0,255";
          } else if (items.length > 3) {
            colour = "214,40,40,255";
          }

          console.log(
            `{\"text\":\"${items.length}\",\"icon_data\": \"${icons.gitHub}\",\"background_color\": \"${colour}\"}`
          );
          console.log = () => {};
        } else {
          console.log(` 💬 ${items.length} `);
        }

        var titles = [];
        var currentNotifications = "";

        items.map((notification, i) => {
          if (lastRepo != notification.repository.full_name) {
            const spacer = new Array(
              notification.repository.full_name.length + 4
            ).join("-");
            if (i > 0) {
              console.log(spacer);
            }
            console.log(notification.repository.full_name);
            console.log(spacer);
            lastRepo = notification.repository.full_name;
          }

          titles.push(notification.subject.title);
          console.log(notification.subject.title);
          currentNotifications += notification.id;
        });

        const lastNotified = db.read("gh.notifications");

        if (lastNotified != currentNotifications) {
          systemCmds.notify(program, {
            title: "PR Updated",
            message: titles.join("\n"),
            icon: config.gitHub.icon,
            timeout: 8
          });
          db.store("gh.notifications", currentNotifications);
        }
      } else {
        console.log("");
        db.store("gh.notifications", "");
      }
    });
  };

  var needingReview = function() {
    const searchOptions = {
      state: "open",
      sort: "updated",
      direction: "desc"
    };

    var prsForReview = repos.map(repoName => {
      var repo = gh.getRepo(me, repoName);

      repo.__fullname = repo.__fullname.replace("[object Object]/", "");
      console.log(JSON.stringify(repo, null, 3));

      return repo.listPullRequests(searchOptions).then((prs, thing) => {
        prs.map(pr => {
          console.log(JSON.stringify(pr, null, 3));
        });
        console.log(thing);
      });
    });

    return Promise.all(prsForReview).then(prs => {
      return prs.reduce((agg, item) => {
        return agg.concat(item);
      }, []);
    });
  };

  var tidyLocalBranches = function(program) {
    getContext();

    let output = [];
    try {
      const specific = program.args.length;

      if (specific && program.args[0].length) {
        return new Promise(() => {
          deleteBranches(program.args.filter(arg => typeof arg === "string"));
        });
      }
    } catch (e) {}

    let baseOptions = {
      async: true,
      shell: config.paths.bash,
      silent: true,
      detached: true
    };
    runningCmd = null;
    deleteCmd =
      'git checkout -q master && git for-each-ref refs/heads/ "--format=%(refname:short)" | while read branch; do mergeBase=$(git merge-base master $branch) && [[ $(git cherry master $(git commit-tree $(git rev-parse $branch^{tree}) -p $mergeBase -m _)) == "-"* ]] && echo $branch; done';

    const prom = new Promise(resolve => {
      runningCmd = shell.exec(deleteCmd, baseOptions, resolve);
    }).then((code, stdout, stderr) => {
      if (stderr) {
        output.push(`${cmd}: (err) ${stderr}`);
      }

      var branches = output.map(branchName => {
        return branchName.replace(/(\\n)*\**\s*/gi, "");
      });
      return deleteBranches(branches);
    });

    runningCmd.unref();
    runningCmd.stdout.on("data", data => {
      output.push(data.toString());
    });

    return prom.then(tidyFollowUp);
  };

  var deleteBranches = function(branches) {
    const spinner = ora("deleting local branches").start();
    var successfulBranches = branches.length;

    const proms = branches.map(branchName => {
      return new Promise(resolve => {
        shell.exec(
          `git branch -D ${branchName}`,
          {
            silent: true,
            async: true
          },
          resolve
        );
      }).then((id, stdout, stderr) => {
        spinner.text = branchName;
        if (stderr) {
          console.error(stderr);
          successfulBranches--;
        }

        return branchName;
      });
    });

    return Promise.all(proms).then(branchNames => {
      spinner.succeed(
        `${successfulBranches} branches already in master were removed locally`
      );
      branchNames.map(branchName => {
        console.log(`ᚼ ${branchName}`);
      });
      console.log(" ");
    });
  };

  var tidyFollowUp = function() {
    let baseOptions = {
      async: true,
      shell: config.paths.bash,
      silent: true,
      detached: true
    };
    runningCmd = null;
    branchCmd =
      'git checkout -q master && git for-each-ref refs/heads/ "--format=%(refname:short)" | while read branch; do echo $branch; done';
    let output = [];
    const prom = new Promise(resolve => {
      runningCmd = shell.exec(branchCmd, baseOptions, resolve);
      return runningCmd;
    }).then((code, stdout, stderr) => {
      if (stderr) {
        output.push(`${cmd}: (err) ${stderr}`);
      }

      return output.reduce((agg, branchName) => {
        const cleaned = branchName.replace(/(\\n)*\**\s*/gi, "");
        if (cleaned.length && cleaned != "master") {
          agg.push(cleaned);
        }
        return agg;
      }, []);
    });

    runningCmd.stdout.on("data", data => {
      output = output.concat(data.toString().split("\n"));
    });

    return prom.then(currentBranches => {
      inquirer
        .prompt([
          {
            name: "branchesToDelete",
            message: "Delete local branches not in master?",
            type: "checkbox",
            choices: currentBranches.map(branchName => {
              return { name: branchName, value: branchName };
            }),
            loop: false,
            pageSize: 30
          }
        ])
        .then(answers => {
          return deleteBranches(answers.branchesToDelete);
        })
        .catch(error => {
          if (error.isTtyError) {
            return;
          } else {
            // Something else when wrong
          }
        });
    });
  };

  return {
    getNotifications: getNotifications,
    notifications: notifications,
    needingReview: needingReview,
    tidyLocalBranches: tidyLocalBranches
  };
})();

module.exports = gitHub;
