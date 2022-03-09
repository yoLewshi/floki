#!/usr/bin/env node
const program = require("commander");
const dockerCmds = require("./cmds/docker.js");
const gitHubCmds = require("./cmds/gitHub.js");
const weatherCmds = require("./cmds/weather.js");
const systemCmds = require("./cmds/system.js");
const figlet = require("figlet");

program
  .option("-q, --quiet", "no extra logs")
  .option("-t --touchbar", "touchbar formatting");

program.addHelpText(
  "after",
  `

  To view available commands:
    $ floki commands`
);

program.parse(process.argv);
if (!program.opts().quiet) {
  console.log("░█ floki █░");
  // console.log(figlet.textSync('floki', {
  //   font: 'dos rebel',
  // }))
}

function listCmds(command) {
  command.parent.commands.map(cmd => {
    console.log(`░█ ${cmd._name} - ${cmd._description}`);
  });
}

program
  .command("chill")
  .alias("ch")
  .description("Pause popsss docker images")
  .action(dockerCmds.pause);

program
  .command("work")
  .alias("w")
  .description("Unpause popsss docker images")
  .action(dockerCmds.resume);

program
  .command("stop")
  .alias("sto")
  .description("Stop popsss docker images")
  .action(dockerCmds.stop);

program
  .command("start")
  .alias("sta")
  .description("Start popsss docker images")
  .action(dockerCmds.start);

program
  .command("weather")
  .alias("w")
  .description("Get today's weather")
  .action(weatherCmds.getWeatherUpdate.bind(null, program));

program
  .command("github")
  .alias("gh")
  .description("Get github notifications info")
  .action(gitHubCmds.notifications.bind(null, program));

program
  .command("tidy")
  .alias("ght")
  .description("Remove merged local branches")
  .action(gitHubCmds.tidyLocalBranches.bind(null, program));

program
  .command("shout")
  .arguments("<title> <message>")
  .alias("s")
  .description("Create system notification")
  .action(systemCmds.notify.bind(null, program));

program
  .command("commands")
  .alias("cmd")
  .description("View available commands")
  .action(listCmds);

program.parse(process.argv);
