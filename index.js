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

program.parse(process.argv);

if (!program.quiet) {
  console.log("░█ floki █░");
  // console.log(figlet.textSync('floki', {
  //   font: 'dos rebel',
  // }))
}

program
  .command("chill")
  .alias("ch")
  .description("Pause docker images")
  .action(dockerCmds.pause);

program
  .command("work")
  .alias("w")
  .description("Unpause docker images")
  .action(dockerCmds.resume);

program
  .command("stop")
  .alias("sto")
  .description("Stop docker images")
  .action(dockerCmds.stop);

program
  .command("start")
  .alias("sta")
  .description("Start docker images")
  .action(dockerCmds.start);

program
  .command("weather")
  .alias("w")
  .description("Get today's weather")
  .action(weatherCmds.getWeatherUpdate.bind(null, program));

program
  .command("github")
  .alias("gh")
  .description("Get github info")
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
  .description("Notify")
  .action(systemCmds.notify.bind(null, program));

program.parse(process.argv);
