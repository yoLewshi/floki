const path = require("path");

const config = {
  paths: {
    bash: "/bin/sh",
    POPSSS: "/Users/username/Documents/GitHub/popsss"
  },
  docker: {
    containers: [
      "popsss_app_1",
      "popsss_postgres_1",
      "popsss_nginx_1",
      "popsss_celery_1",
      "popsss_redis_1",
      "popsss_plugin-server_1",
      "popsss_webpack-dev-server_1"
    ]
  },
  gitHub: {
    token: "your-github-token-with-notifications-permission",
    icon: path.join(__dirname, "..", "img/github.png")
  },
  weather: {
    darkSkyKey: "darksky-api-key",
    location: {
      latitude: 51.5074,
      longitude: 0.1278
    }
  }
};

module.exports = config;
