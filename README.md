## How to start joepegs manual sniper using the pm2

To create a new instance use this command

```
pm2 start manual.sh --no-autorestart --name your-bot-name -- here args blabla
```

To use the current instance

```
pm2 restart manual-bot-X -- contractAddress timestamp botname
```

Example of a script to pass the args into the run time

```
#!/bin/bash
set -x
cd joepegs-sniper/
git pull
npm ci
ADDRESS=$1 TIMESTAMP=$2 BOTNAME=$3 npm run start-manual
```

In the npm scripts you can write it like this

```
"start-manual": "ts-node scripts/manual-bot.ts $ADDRESS $TIMESTAMP $BOTNAME",
```
