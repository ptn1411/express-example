module.exports = {
  apps: [
    {
      name: "ptn1411/api",
      script: "env-cmd -f .env.production node ./build/index.js",
      watch: false,
      instances: 1,
    },
  ],
};
