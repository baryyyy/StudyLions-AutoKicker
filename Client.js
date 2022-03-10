const Discord = require("discord.js")
const client = new Discord.Client({
    intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS"]
})
global.db = require("quick.db")
global.client = client
const { getConfig, logger , checkActivity  } = require("./Utils.js")
global.getConfig = getConfig
global.logger = logger
let clientCommands = new Discord.Collection()
/* Read events from folder & handle */
const fs = require("fs")
fs.readdir("./Events/", (err, files) => {
    if (err) return console.error(err)
    files.filter(f => f.endsWith(".js")).forEach(file => {
        try {
            const event = require(`./Events/${file}`)
            let eventName = file.split(".")[0]
            client.on(event.config.event, event)
            logger("debug", `EVENT ${eventName} LOADED!`)
        } catch (e) {
            logger("error" , `Error While Handling Event ${file.split(".")[0]} - ${e}`)
        }
        
    })
})


client.login(getConfig.token)

module.exports = client