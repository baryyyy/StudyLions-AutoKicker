const Discord = require("discord.js");
const db = global.db

module.exports = (message) => {
    /* Detect A Bot Author */
    if (!message.guild) return
    if (message.webhookID) return
    if (message.author.bot) return
    if (message.channel.type == "dm") return

    
}


module.exports.config = {
    event: 'messageCreate'
}