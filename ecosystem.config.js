// PM2 süreç yapılandırması — sunucuda: pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "isimlistem",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
  ],
};
