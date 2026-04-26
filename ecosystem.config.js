module.exports = {
  apps: [
    {
      name: "ptn1411/api",
      script: "env-cmd -f .env.production node ./build/index.js",
      watch: false,
      instances: 1,
      watch: ["src"],
      ignore_watch: ["node_modules", "build"],
      watch_options: {
        followSymlinks: false,
      },
    },
  ],
};
