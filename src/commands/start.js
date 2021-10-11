const fs = require('fs');
const fileCheck = require('../js/file_checker');
require('dotenv').config();
const moment = require('moment-timezone');

var command = function (args, message, client, Discord) {

    function sendMessage() {
        var buttons = [
            new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId('balance')
                        .setLabel('Balance')
                        .setEmoji('💰')
                        .setStyle('PRIMARY')
                ),
            new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId('deposit')
                        .setLabel('Deposit')
                        .setEmoji('📥')
                        .setStyle('PRIMARY')
                )
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId('withdraw')
                        .setLabel('Withdraw')
                        .setEmoji('📤')
                        .setStyle('PRIMARY')
                ),
            new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId('play')
                        .setLabel('Play')
                        .setEmoji('🎲')
                        .setStyle('PRIMARY')
                )
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId('guide')
                        .setLabel('Guide')
                        .setEmoji('❓')
                        .setStyle('PRIMARY')
                )
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId('referral')
                        .setLabel('Referral')
                        .setEmoji('🔗')
                        .setStyle('PRIMARY')
                )
        ]

        message.reply({
            embeds: [{
                color: 0x0099ff,
                title: `Welcome To Pula-Puti Bot`,
                description: `*Please Choose Your Next Action By Pressing A Button Below*`
            }],
            components: buttons
        });
    }

    if (fileCheck(`./data/balances/${message.author.id}.json`) == false) {

        var timeInLondon = moment.tz(new Date(), 'Europe/London');
        var timeInManila = timeInLondon.tz('Asia/Manila');
        var DateAndTime = timeInManila.format('YYYY-MM-DD hh:mm:ss');

        var array = {
            balance: {
                chips: 0,
                withdrawable: 0
            },
            id: message.author.id,
            inviter: null,
            invites: [],
            total: {
                deposit: 0,
                withdraw: 0
            },
            dateJoined: DateAndTime,
            withdraw_info : {}
        }

        var buttons = [
            new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId('yes')
                        .setLabel('Yes')
                        .setEmoji('✔️')
                        .setStyle('SUCCESS')
                )
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId('no')
                        .setLabel('No')
                        .setEmoji('❌')
                        .setStyle('DANGER')
                )
        ]

        message.author.send({
            embeds: [{
                color: 'GREEN',
                title: `Do You Have A Invitation Code?`,
                description: `Your Inviter Will Earn A Commision Everytime You Deposit`
            }],
            components: buttons
        }).then(sentMessage => {
            var collector = sentMessage.channel.createMessageComponentCollector();
            var replyCollector;
            collector.on('collect', async i => {

                var data = JSON.parse(JSON.stringify(i));
                console.log(data.customId)
                if (data.customId == 'yes') {
                    i.update({
                        embeds: [{
                            color: 'GREEN',
                            title: `Please Send The Code Of Your Inviter.`,
                            description: `Click Cancel To Cancel And Proceed Without A Inviter.`
                        }],
                        components: [
                            new Discord.MessageActionRow()
                                .addComponents(
                                    new Discord.MessageButton()
                                        .setCustomId('cancel')
                                        .setLabel('Cancel')
                                        .setEmoji('❌')
                                        .setStyle('DANGER')
                                )
                        ]
                    }).then(() => {
                        replyCollector = new Discord.MessageCollector(message.channel);

                        replyCollector.on('collect', reply => {
                            var user = reply.content;

                            if (reply.author.bot) return;

                            if (fileCheck(`./data/balances/${user}.json`)) {
                                var inviters_data = require(`../data/balances/${user}.json`);
                                array.inviter = user;
                                inviters_data.invites.unshift({
                                    user: message.author.id,
                                    earned: 0
                                });

                                fs.writeFileSync(`./data/balances/${user}.json`, JSON.stringify(inviters_data, null, 3));
                                fs.writeFileSync(`./data/balances/${message.author.id}.json`, JSON.stringify(array, null, 3));
                                var role = process.env.ROLE_ID;

                                client.guilds.cache.get(process.env.GUILD_ID).members.fetch(message.author.id).then(user => {
                                    user.roles.add(role)
                                });
                                replyCollector.stop();
                                collector.stop();
                                sendMessage();
                                client.users.fetch(user).then(author => {
                                    author.send({
                                        embeds: [{
                                            color: 'GREEN',
                                            title: `A New User Used Your Code.`,
                                            description: `User Info : \nID : ${message.author.id}\nUsername : <@${message.author.id}>`
                                        }]
                                    });
                                })
                            } else {
                                message.channel.send({
                                    content: `Code Not Found Please Try Again.`
                                })
                            }

                        })
                    })
                }

                if (data.customId == 'no') {
                    collector.stop();
                    sentMessage.delete();
                    sendMessage();

                    fs.writeFileSync(`./data/balances/${message.author.id}.json`, JSON.stringify(array, null, 3));
                    var role = process.env.ROLE_ID;

                    client.guilds.cache.get(process.env.GUILD_ID).members.fetch(message.author.id).then(user => {
                        user.roles.add(role)
                    });
                }

                if (data.customId == 'cancel') {
                    collector.stop();
                    sentMessage.delete();
                    sendMessage();
                    replyCollector.stop();

                    fs.writeFileSync(`./data/balances/${message.author.id}.json`, JSON.stringify(array, null, 3));
                    var role = process.env.ROLE_ID;

                    client.guilds.cache.get(process.env.GUILD_ID).members.fetch(message.author.id).then(user => {
                        user.roles.add(role)
                    });
                }
            })

        })

    } else {
        sendMessage();
    }
}

module.exports = command;