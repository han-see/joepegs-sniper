import { Monitor } from "forever-monitor"

const mainChild = new Monitor("main.ts", {
    max: 0,
    silent: true,
    args: [],
})

mainChild.on("exit", () => {
    console.log("main.ts has exited after 3 restarts")
})

mainChild.start()
