![image](https://user-images.githubusercontent.com/52404579/131706825-98a7b3f8-e249-47c3-b0a4-bc56b9864040.png)


A collection of cmds to make life easier, many are optimised to work well with [TextBar](http://richsomerfield.com/apps/textbar/) and [BetterTouchTool](https://www.folivora.ai/)

## Example cmds

- `floki chill` pauses an array of docker containers (useful if your laptop is freaking out)
- `floki github` retrieves your current github notifications
- `floki tidy` removes any local branches in the current git directory that are already contained within master and gives you the option to remove any others not contained in master.
- `floki shout "the title" "the message"` uses terminal-notifier to produce a system notification

## Getting Started

You will need node.js and npm installed.

Make a copy of the `config_example.js` file and name it `config.js` then update the values inside with your details.

Notifications are done with [node-notifier]`https://www.npmjs.com/package/node-notifier` you may need to install terminal-notifier for it to work. This can be done with homebrew on mac `brew install terminal-notifier`. You may have issues getting the notifications to show, but there are some useful pages online to help.

**In a terminal open the `floki` directory and run `npm link` to make the `floki` cmd accessible globally.**

#### TextBar

![image](https://user-images.githubusercontent.com/52404579/133063595-dedaf0c0-50b2-4548-a6a1-7f962d8285ec.png)

If you're using TextBar try setting up a script with `floki github -q` the `-q` flag can be used on a number of floki cmds to limit the output. Use `textbar_scripts/openGitHubNotifications.sh` as the action script to go straight to your notifications when you click the textbar modal

#### BetterTouchTool

Setting up scripts is a little more complex in BTT, try an `Apple Script / Javascript Widget` with the following set as `Source Type: Real JavaScript` (make sure to update the path with your PATH variable and switch out zsh if you're using a different shell):

```
(async () => {
let shellScript = `floki weather -qt`;
let shellScriptWrapper = {
    script: shellScript,
    launchPath: 'bin/zsh',
    parameters: '-c',
    environmentVariables: 'PATH=/usr/local/opt/ruby/bin:/Users/yourusername/.nvm/versions/node/v10.17.0/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin/floki';
};

let result = await runShellScript(shellScriptWrapper);
returnToBTT(result);
})();
```

Then set the `Execute script every X seconds` variable (3,600 is a decent value)
