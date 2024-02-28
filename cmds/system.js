const notifier = require('node-notifier');
const path = require('path');

var system = function()
{

  var notify = function(program, options)
  {
    const title = options.title || program.args[0];
    const message = options.message || program.args[1];

    return new Promise((resolve) => {
      notifier.notify(
        {
          title: title,
          message: message,
          wait: true,
          icon: (options.icon || path.join(__dirname, '..', 'img/runes.png')),
          contentImage: (options.icon || path.join(__dirname, '..', 'img/runes.png')),
        }, (err, response, meta) => {
          // console.log(response)
          // console.log(meta)
        if(err)
        {
          console.error(err);
        }

        if(response != "timeout")
        {
          console.log(response);
        }
      });
      notifier.on('timeout', resolve);
    })
  }

  return{
    notify: notify
  }

}();

module.exports = system;
