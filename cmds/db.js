const fs = require("fs");
const path = require("path");

const db = (function() {
  var store = function(key, value) {
    let file = getFile();
    file[key] = value;
    fs.writeFileSync(
      path.join(__dirname, "../", "db.json"),
      JSON.stringify(file, null, 3)
    );
  };

  var read = function(key) {
    return getFile()[key];
  };

  var getFile = function() {
    let fileContent = fs.readFileSync(path.join(__dirname, "../", "db.json"));
    try {
      return JSON.parse(fileContent);
    } catch (e) {
      return {};
    }
  };

  return {
    store: store,
    read: read
  };
})();

module.exports = db;
