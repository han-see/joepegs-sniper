import { MessageEmbed, WebhookClient } from "discord.js"
import { Logger } from "tslog"
import { DISCORD_WEBHOOK } from "../config"

/**
 * This class is use to send a message to the user discord
 */
export class Webhook {
    private log = new Logger()
    private embed: MessageEmbed
    private userWebhookClient = new WebhookClient({
        url: DISCORD_WEBHOOK,
    })

    constructor(private title: string) {
        this.embed = new MessageEmbed().setTitle(this.title).setTimestamp()
    }

    async sendMessageToUser(content: string, txhash?: string) {
        this.embed.setDescription(content)
        txhash ? this.embed.setURL(`https://snowtrace.io/tx/${txhash}`) : ""
        await this.userWebhookClient
            .send({
                content: `<@${process.env.DISCORD_USER_ID}>\n${this.embed.title}`,
                embeds: [this.embed],
            })
            .catch((err) => {
                this.log.error("Cannot send message to discord", err)
            })
    }

    async sendInfoMessage(content: string) {
        this.embed.setDescription(content)
        await this.userWebhookClient
            .send({
                embeds: [this.embed],
            })
            .catch((err) => {
                this.log.error("Cannot send message to discord", err)
            })
    }
}
