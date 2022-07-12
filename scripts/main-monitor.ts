import { Monitor } from "forever-monitor"
import { Webhook } from "../commons/Webhook"

const mainBot = new Monitor("./main.ts", {
    max: 3,
    silent: true,
    args: [],
})

const manualBot = new Monitor("./manual-bot.ts", {
    max: 0,
    silent: true,
    args: [],
})

mainBot.on("exit", () => {
    console.log("main has exited after 3 restarts")
    const webhook = new Webhook("Error")
    webhook.sendMessageToUser("main.ts has exited after 3 restarts")
})

manualBot.on("exit", () => {
    console.log("manual-bot has exited after 3 restarts")
    const webhook = new Webhook("Error")
    webhook.sendMessageToUser("Manual bot cannot start")
})

mainBot.start()
manualBot.start()
