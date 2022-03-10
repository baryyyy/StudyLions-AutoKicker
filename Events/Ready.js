const ActivityHandler = require("../ActivityHandler").ActivityHandler
var Handler;
module.exports = async () => {
    global.logger('info', `Discord Client Ready | Logged In As ${global.client.user.tag} (${global.client.user.id}) | Servers: ${global.client.guilds.cache.size} | Members: ${global.client.users.cache.size}`)
    let guild_info = global.client.guilds.cache.get(global.getConfig.mainGuild)
    let guildMemberCount = await guild_info.members.fetch().then(members => {
        return members.map(m => m.id)
    })
    await global.client.user.setPresence({ activities: [{ name: `${guildMemberCount.length} Students!`, type: 'WATCHING' }], status: 'idle' });
    if (global.db.get(`mainUptime`) == null) {
        global.db.set(`mainUptime`, Date.now())
        global.logger(`warn`, `Detected New Bot Instance! Saving Current Uptime To Database!`)
    }
    Handler = new ActivityHandler(global.client, global.db.get(`mainUptime`))
    Handler.registerDiscordEvents()
    Handler.startMonitor()

}


module.exports.config = {
    event: 'ready'
}