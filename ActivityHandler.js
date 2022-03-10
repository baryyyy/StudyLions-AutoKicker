const Discord = require("discord.js")
class ActivityHandler {

    constructor(client, mainUptime) {
        if (!client) return global.logger(`error`, "No client provided!")
        let test = false
        this.sleep = require('sleep');
        this.alertMessage = `Hey {member}!

It seems like you are not so active on "The Study Lions" server.
To keep our members safe, we remove inactive users who don't use the text channels. 
You will be kicked due to inactivity in 7 days, but you can always come back using the following link: https://discord.gg/studylions

Good luck with your studies.`
        if (test) {
            this.noActivityTimeout = 20000
            this.noActivityAlertTimeout = 10000
            this.monitorInterval = 2000
        } else {
            this.noActivityTimeout = 21 * 24 * 60 * 60 * 1000
            this.noActivityAlertTimeout = 14 * 24 * 60 * 60 * 1000
            this.monitorInterval = 24 * 60 * 60 * 1000
        }
        this.mainGuild = client.guilds.cache.get(global.getConfig.mainGuild)
        this.mainUptime = mainUptime
        const Mutex = require("async-mutex").Mutex
        this.mutex = new Mutex();
    }

    registerDiscordEvents() {
        let _this = this;
        global.client.on("messageCreate", (message) => {
            _this.onClientMessage(message)
        })
        global.client.on("guildMemberAdd", (member) => {
            _this.onGuildMemberAdd(member)
        })
        global.client.on("guildMemberRemove", (member) => {
            _this.onGuildMemberRemove(member)
        })
        global.client.on("interactionCreate", (member) => {
            _this.onGuildInteractionCreate(member)
        })
    }

    async monitorMembers() {
        let _this = this;
        _this.mutex.runExclusive(function () {
            let now = Date.now()
            let guild = global.client.guilds.cache.get(global.getConfig.mainGuild)
            let membersArray = []
            guild.members.fetch().then(async members => {
                members.forEach(member => {
                    if (!member.roles.cache.has('780305340784443422')) {
                        if (!member.roles.cache.has(`883036819619446834`))
                            if (!member.permissions.has("MANAGE_MESSAGES")) {
                                if (!member.user.bot) {
                                    membersArray.push(member)
                                }
                            }

                    }
                })
                let inactiveMembersList = [];
                let alertMembersList = [];
                for (let j = 0; j < membersArray.length; j++) {
                    let member = membersArray[j]
                    let memberActivity = await _this._isMemberActive(guild, member, now)
                    if (memberActivity.isActive) {
                        if (memberActivity.isAlert) {
                            let memberAlertData = global.db.get(`lastAlert_${member.guild.id}_${member.id}`)
                            if (memberAlertData == null || memberAlertData.Date !== memberActivity.lastActivityDate) {
                                alertMembersList.push(member)
                            }
                        }
                    } else {
                        inactiveMembersList.push(member)
                    }
                }
                _this.handleAlertMembers(alertMembersList, _this)
                _this.handleInactiveMembers(inactiveMembersList)
            })
        })
    }
    async handleAlertMembers(alertMembersList, _this) {
        // Send alert messages to members while taking care of the discord rate limits
        const RATE_LIMIT_PER_SECOND = 30; // 30 because Discord limits to 50 requests per second
        let rateLimitCounter = 0;
        for (let i = 0; i < alertMembersList.length; i++) {
            if (rateLimitCounter >= RATE_LIMIT_PER_SECOND) {
                rateLimitCounter = 0;
                _this.sleep.msleep(1000);
            }
            let member = alertMembersList[i]
            let alertMessage = _this.alertMessage.replace("{member}", member.user.tag)
            await member.send(alertMessage)
                .then(m => {
                    global.db.set(`lastAlert_${member.guild.id}_${member.id}`, { Date: memberActivity.lastActivityDate })
                    let guild = global.client.guilds.cache.get(global.getConfig.mainGuild)
                    let channel = guild.channels.cache.get(global.getConfig.inactiveMembersChannel)
                    channel.send(`**\`${member.user.tag}\` Has been alerted due to inactivity.**`)
                })
                .catch(e => { })
            ++rateLimitCounter;
        }
    }
    handleInactiveMembers(inactiveMembersList) {
        let guild = global.client.guilds.cache.get(global.getConfig.mainGuild)
        if (global.db.get(`messageKickList_${guild.id}`)) return;
        // send 10 members to channel
        let membersToRemove = []
        for (let i = 0; i < inactiveMembersList.length && i < 10; i++) {
            let member = inactiveMembersList[i]
            membersToRemove.push(member)
        }
        if (membersToRemove.length > 0) {
            let channel = guild.channels.cache.get(global.getConfig.inactiveMembersChannel)
            const row = new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId('kick_members_inactive')
                        .setLabel(`Kick ${membersToRemove.length} Inactive members`)
                        .setStyle('DANGER'),
                );
            channel.send({
                content: `Kick ${membersToRemove.length} inactive members? (${membersToRemove.length}/${inactiveMembersList.length})\n${membersToRemove.join("\n")}`,
                components: [row]
            }).then(message => {
                global.db.set(`messageKickList_${guild.id}`, { channelId: message.channel.id, members: membersToRemove, messageId: message.id })
            })
        }
    }
    startMonitor() {
        this.monitorMembers()
        this.monitor = setInterval(() => {
            this.monitorMembers()
        }, this.monitorInterval)
    }
    isMemberActive(guild, member) {
        return this._isMemberActive(guild, member, Date.now())
    }
    async _isMemberActive(guild, member, now) {
        let _activity = await global.db.get(`lastActivity_${guild.id}_${member.user.id}`)
        if (_activity == null) {
            let clientFirstUptime = this.mainUptime
            return { isActive: (clientFirstUptime + this.noActivityTimeout > now), lastActivityDate: clientFirstUptime, isAlert: (clientFirstUptime + this.noActivityAlertTimeout < now) }
        } else {
            return { isActive: (_activity.Date + this.noActivityTimeout > now), lastActivityDate: _activity.Date, isAlert: _activity.Date + this.noActivityAlertTimeout < now }
        }
    }

    onClientMessage(message) {
        this._onClientMessage(message, Date.now());
    }
    _onClientMessage(message, date) {
        if (!message.guild) return
        if (message.webhookID) return
        if (message.author.bot) return
        if (message.channel.type == "dm") return
        /* Handle Message */
        global.db.set(`lastActivity_${message.guild.id}_${message.author.id}`, { Message: message, Date: date })
    }

    async onGuildInteractionCreate(interaction) {
        if (interaction.isButton()) {
            if (interaction.customId == "kick_members_inactive") {
                await interaction.deferReply()
                let dbMessage = global.db.get(`messageKickList_${interaction.guild.id}`)
                if (dbMessage == null) {
                    return interaction.followUp("Internal server error! Please contact a developer.")
                } else {
                    if (interaction.message.id == dbMessage.messageId) {
                        let toKickMembers = dbMessage.members
                        let now = Date.now()
                        let membersFailedKick = 0
                        for (let i = 0; i < toKickMembers.length; i++) {
                            let member = toKickMembers[i]
                            let memberActivity = await this._isMemberActive({ id: member.guildId }, { user: { id: member.userId } }, now)
                            if (memberActivity.isActive) {
                                continue;
                            } else {
                                console.log("Trying to kick: " + member.userId)
                                let fetchedMember = await interaction.guild.members.fetch(member.userId).catch(e => { })
                                if (fetchedMember) {
                                    await fetchedMember.kick()
                                        .catch(e => {
                                            console.log("Could not kick member " + member.userId)
                                            membersFailedKick++
                                        })

                                }
                            }
                        }
                        global.db.delete(`messageKickList_${interaction.guild.id}`)
                        this.monitorMembers()
                        return interaction.followUp(`**Trying to kick \`${toKickMembers.length}\` inactive members.\nFailed to kick \`${membersFailedKick}\` members!**`)
                    }
                    else {
                        return interaction.followUp("This kick list is not available anymore. Please check out the newest kick list message.")
                    }
                }
            }
        }


    }

    onGuildMemberAdd(member) {
        global.db.set(`lastActivity_${member.guild.id}_${member.id}`, { Message: null, Date: Date.now() })
    }

    onGuildMemberRemove(member) {
        global.db.delete(`lastActivity_${member.guild.id}_${member.id}`)
    }
}


module.exports = {
    ActivityHandler: ActivityHandler
}


