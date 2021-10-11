require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES",
        "DIRECT_MESSAGES"
    ],
    partials: [
        "CHANNEL"
    ]
});

const fs = require('fs');
const commands = require('./commands');
const game_info = require('./game.json');
const random = require('random');
const IterateObject = require('iterate-object');
const fileCheck = require('./js/file_checker');
const admins = require('./data/admins.json');
const totals = require('./data/total.json');
const moment = require('moment-timezone');
const { resolve } = require('path/posix');
const { rejects } = require('assert');
const withdraw = require('./data/withdraw.json');

const findDuplicate = arry => arry.filter((item, index) => arry.indexOf(item) !== index)
//["pula", "puti", "pula", "puti", "pula", "star", "puti", "pula", "puti", "pula", "puti"]
var choices = ["pula", "puti", "pula", "puti", "pula", "puti", "pula", "puti", "pula", "puti", "star"];
var choicesBet = ["red", "white", "star"];
var emoji = {
    pula: "🔴",
    puti: "⚪",
    star: "⭐"
}

function randomInt() {
    return random.int((min = 0), (max = choices.length - 1))
}

function randomHighNumber() {
    return random.int((min = 0), (max = Number.MAX_VALUE))
}

function rowGenerator() {
    return [
        new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setEmoji(emoji[choices[randomInt()]])
                    .setLabel(" ")
                    .setCustomId(`result${randomHighNumber()}`)
                    .setStyle("SECONDARY")
                    .setDisabled(true)
            )
            .addComponents(
                new Discord.MessageButton()
                    .setEmoji(emoji[choices[randomInt()]])
                    .setLabel(" ")
                    .setCustomId(`result${randomHighNumber()}`)
                    .setStyle("SECONDARY")
                    .setDisabled(true)
            )
            .addComponents(
                new Discord.MessageButton()
                    .setEmoji(emoji[choices[randomInt()]])
                    .setLabel(" ")
                    .setCustomId(`result${randomHighNumber()}`)
                    .setStyle("SECONDARY")
                    .setDisabled(true)
            ),
        new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setEmoji(emoji[choices[randomInt()]])
                    .setLabel(" ")
                    .setCustomId(`result${randomHighNumber()}`)
                    .setStyle("SECONDARY")
                    .setDisabled(true)
            )
            .addComponents(
                new Discord.MessageButton()
                    .setEmoji(emoji[choices[randomInt()]])
                    .setLabel(" ")
                    .setCustomId(`result${randomHighNumber()}`)
                    .setStyle("SECONDARY")
                    .setDisabled(true)
            )
            .addComponents(
                new Discord.MessageButton()
                    .setEmoji(emoji[choices[randomInt()]])
                    .setLabel(" ")
                    .setCustomId(`result${randomHighNumber()}`)
                    .setStyle("SECONDARY")
                    .setDisabled(true)
            ),
        new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setEmoji(emoji[choices[randomInt()]])
                    .setLabel(" ")
                    .setCustomId(`result${randomHighNumber()}`)
                    .setStyle("SECONDARY")
                    .setDisabled(true)
            )
            .addComponents(
                new Discord.MessageButton()
                    .setEmoji(emoji[choices[randomInt()]])
                    .setLabel(" ")
                    .setCustomId(`result${randomHighNumber()}`)
                    .setStyle("SECONDARY")
                    .setDisabled(true)
            )
            .addComponents(
                new Discord.MessageButton()
                    .setEmoji(emoji[choices[randomInt()]])
                    .setLabel(" ")
                    .setCustomId(`result${randomHighNumber()}`)
                    .setStyle("SECONDARY")
                    .setDisabled(true)
            )
    ]
}

client.on('ready', () => {
    console.log(`${client.user.tag} Is Now Online`);
});

client.on('messageCreate', (message) => {
    if (message.author.bot) {
        return
    }

    if (message.guild) {
        //In Guild

        if (message.channelId !== process.env.CHANNEL_ID) return;

        var choice = message.content.split(/\s+/)[0].toLowerCase();
        var amount = message.content.split(/\s+/)[1];
        var color;

        if (choicesBet.includes(choice) && amount) {
            if (isNaN(amount)) {
                message.delete();
                message.author.send({
                    embeds: [{
                        color: "GREY",
                        title: `Bet Not Accepted`,
                        description: `*Your Last Bet Was Invalid Please Use The Proper Format.*`,
                        fields: [{
                            name: "Correct Format",
                            value: "choice amount"
                        }, {
                            name: "Example",
                            value: "pula 10"
                        }]
                    }]
                })

                return
            }

            if (["red"].includes(choice)) {
                color = "pula"
            }

            if (["white"].includes(choice)) {
                color = "puti"
            }

            if (["star"].includes(choice)) {
                color = "star"
            }

            amount = parseFloat(amount);

            if (amount < 5) {
                message.delete();
                message.author.send({
                    embeds: [{
                        color: 'RED',
                        title: `Bet Not Accepted`,
                        description: `_Your Last Bet Did Not Reach The Minimum Bet Of ₱5_`
                    }]
                });
                return
            }

            if (amount > 1000) {
                message.delete();
                message.author.send({
                    embeds: [{
                        color: 'RED',
                        title: `Bet Not Accepted`,
                        description: `_Your Last Bet Is Bigger Than The Maximum Bet Of ₱1000_`
                    }]
                });
                return
            }
            var user_data;
            var chips;
            var withdrawable;
            if (fileCheck(`./data/balances/${message.author.id}.json`) == false) {
                message.delete();
                message.author.send({
                    embeds: [{
                        color: "RED",
                        title: `You Can't Use The Bot.`,
                        description: `Please Send The Command /start To Me To Be Able To Start Using The Bot.`
                    }]
                });

                return
            } else {
                user_data = require(`./data/balances/${message.author.id}.json`);
                chips = user_data.balance.chips;
                withdrawable = user_data.balance.withdrawable;
            }

            if (game_info.count == 0) {
                //First Bet


                if (chips >= amount) {

                    user_data.balance.chips -= amount;
                    fs.writeFileSync(`./data/balances/${message.author.id}.json`, JSON.stringify(user_data, null, 3));

                    let array = {
                        user: message.author.id,
                        bet: [],
                        total: 0
                    }

                    if (!game_info.list[message.author.id]) {
                        game_info.list[message.author.id] = array;
                    }

                    if (game_info.list[message.author.id].total >= 1000) {
                        user_data.balance.chips += amount;
                        fs.writeFileSync(`./data/balances/${message.author.id}.json`, JSON.stringify(user_data, null, 3));

                        message.delete();
                        message.author.send({
                            embeds: [{
                                color: 'RED',
                                title: `Bet Not Accepted`,
                                description: `_You Already Reached The Maximum Bet Of ₱1000._`
                            }]
                        });
                        return
                    }

                    if (game_info.list[message.author.id].total + amount > 1000) {
                        user_data.balance.chips += amount;
                        fs.writeFileSync(`./data/balances/${message.author.id}.json`, JSON.stringify(user_data, null, 3));

                        message.delete();
                        message.author.send({
                            embeds: [{
                                color: 'RED',
                                title: `Bet Not Accepted`,
                                description: `_Your Last Bet Will Exceed The Maximum Bet Of ₱1000._`
                            }]
                        });
                        return
                    }

                    game_info.count += 1;
                    game_info.id += 1;
                    game_info.list[message.author.id].bet.unshift({
                        choice: choice,
                        amount: amount,
                        color: color
                    });
                    game_info.list[message.author.id].total += amount;
                    game_info.total[color] += amount;
                    fs.writeFileSync('./game.json', JSON.stringify(game_info, null, 3));

                    async function result() {

                        var role = message.guild.roles.cache.find(r => r.name === "Player");

                        await message.channel.permissionOverwrites.edit(role, {
                            SEND_MESSAGES: false
                        });

                        var result1 = randomInt();
                        var result2 = randomInt();
                        var result3 = randomInt();

                        var resultList = [];
                        resultList.unshift(choices[result1]);
                        resultList.unshift(choices[result2]);
                        resultList.unshift(choices[result3]);

                        const counts = {};
                        resultList.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; });
                        console.log(counts)

                        var winner;
                        var multiplier;

                        if (counts.star > 1) {
                            winner = "star";
                            multiplier = 8;
                        } else if (counts.puti > 1) {
                            winner = "puti";
                            multiplier = 2;
                        } else if (counts.pula > 1) {
                            winner = "pula"
                            multiplier = 2;
                        } else if (counts.puti == 1 && counts.pula == 1 && counts.star == 1) {
                            winner = "draw"
                        }

                        var row1 = rowGenerator();
                        var row2 = rowGenerator();
                        var row3 = rowGenerator();
                        var row4 = rowGenerator();

                        message.channel.send({
                            embeds: [{
                                color: "GREY",
                                title: "🚫 Bets Closed",
                                description: `Here Are The Summaries Of Game #${game_info.id}\n\n🔴🔴 - ₱${game_info.total.pula} (x 2.00)\n⚪⚪ - ₱${game_info.total.puti} (x 2.00)\n⭐⭐ - ₱${game_info.total.star} (x 8.00)`
                            }]
                        })

                        message.channel.send({
                            embeds: [{
                                color: "GREY",
                                title: "Rolling Results",
                                description: "Please Wait For The Results To Be Rolled."
                            }],
                            components: row1
                        }).then(sentMessage => {
                            sentMessage.edit({
                                embeds: [{
                                    color: "GREY",
                                    title: "Rolling Results",
                                    description: "Please Wait For The Results To Be Rolled."
                                }],
                                components: row2
                            }).then(sentMessage => {
                                sentMessage.edit({
                                    embeds: [{
                                        color: "GREY",
                                        title: "Rolling Results",
                                        description: "Please Wait For The Results To Be Rolled."
                                    }],
                                    components: row3
                                }).then(sentMessage => {
                                    sentMessage.edit({
                                        embeds: [{
                                            color: "GREY",
                                            title: "Rolling Results",
                                            description: "Please Wait For The Results To Be Rolled."
                                        }],
                                        components: row4
                                    }).then(sentMessage => {
                                        var resultRow = [
                                            new Discord.MessageActionRow()
                                                .addComponents(
                                                    new Discord.MessageButton()
                                                        .setEmoji("⬇️")
                                                        .setLabel(" ")
                                                        .setCustomId(`result${randomHighNumber()}`)
                                                        .setStyle("SECONDARY")
                                                        .setDisabled(true)
                                                )
                                                .addComponents(
                                                    new Discord.MessageButton()
                                                        .setEmoji("⬇️")
                                                        .setLabel(" ")
                                                        .setCustomId(`result${randomHighNumber()}`)
                                                        .setStyle("SECONDARY")
                                                        .setDisabled(true)
                                                )
                                                .addComponents(
                                                    new Discord.MessageButton()
                                                        .setEmoji("⬇️")
                                                        .setLabel(" ")
                                                        .setCustomId(`result${randomHighNumber()}`)
                                                        .setStyle("SECONDARY")
                                                        .setDisabled(true)
                                                ),
                                            new Discord.MessageActionRow()
                                                .addComponents(
                                                    new Discord.MessageButton()
                                                        .setEmoji(emoji[choices[result1]])
                                                        .setLabel(" ")
                                                        .setCustomId(`result${randomHighNumber()}`)
                                                        .setStyle("PRIMARY")
                                                        .setDisabled(true)
                                                )
                                                .addComponents(
                                                    new Discord.MessageButton()
                                                        .setEmoji(emoji[choices[result2]])
                                                        .setLabel(" ")
                                                        .setCustomId(`result${randomHighNumber()}`)
                                                        .setStyle("PRIMARY")
                                                        .setDisabled(true)
                                                )
                                                .addComponents(
                                                    new Discord.MessageButton()
                                                        .setEmoji(emoji[choices[result3]])
                                                        .setLabel(" ")
                                                        .setCustomId(`result${randomHighNumber()}`)
                                                        .setStyle("PRIMARY")
                                                        .setDisabled(true)
                                                ),
                                            new Discord.MessageActionRow()
                                                .addComponents(
                                                    new Discord.MessageButton()
                                                        .setEmoji("⬆️")
                                                        .setLabel(" ")
                                                        .setCustomId(`result${randomHighNumber()}`)
                                                        .setStyle("SECONDARY")
                                                        .setDisabled(true)
                                                )
                                                .addComponents(
                                                    new Discord.MessageButton()
                                                        .setEmoji("⬆️")
                                                        .setLabel(" ")
                                                        .setCustomId(`result${randomHighNumber()}`)
                                                        .setStyle("SECONDARY")
                                                        .setDisabled(true)
                                                )
                                                .addComponents(
                                                    new Discord.MessageButton()
                                                        .setEmoji("⬆️")
                                                        .setLabel(" ")
                                                        .setCustomId(`result${randomHighNumber()}`)
                                                        .setStyle("SECONDARY")
                                                        .setDisabled(true)
                                                )
                                        ]
                                        sentMessage.edit({
                                            embeds: [{
                                                color: "GREY",
                                                title: "Rolled Result",
                                                description: "The Game Result Is Posted Below."
                                            }],
                                            components: resultRow
                                        }).then(() => {

                                            async function distributeWinnings() {
                                                await IterateObject(game_info.list, async (info, user) => {

                                                    var total = {
                                                        bet: 0,
                                                        winnings: 0
                                                    };
                                                    var winner_data = require(`./data/balances/${info.user}.json`)

                                                    await info.bet.forEach((bet) => {
                                                        if (bet.color == winner) {

                                                            winner_data.balance.withdrawable += (bet.amount * multiplier);
                                                            total.bet += bet.amount;
                                                            total.winnings += (bet.amount * multiplier)
                                                            fs.writeFileSync(`./data/balances/${info.user}.json`, JSON.stringify(winner_data, null, 3));
                                                        }
                                                    });

                                                    if (total.winnings > 0) {
                                                        client.users.fetch(user).then(author => {
                                                            author.send({
                                                                embeds: [{
                                                                    color: 'GREEN',
                                                                    title: `Winnings For Game #${game_info.id}`,
                                                                    description: `*You Have Won ₱${total.winnings} For Betting A Total Of ₱${total.bet} On* ${emoji[winner]}${emoji[winner]}\n\n**Current Balance: ₱${winner_data.balance.chips + winner_data.balance.withdrawable}**`
                                                                }]
                                                            })
                                                        })
                                                    }

                                                });

                                                game_info.total = {
                                                    "pula": 0,
                                                    "puti": 0,
                                                    "star": 0
                                                };
                                                game_info.list = {};
                                                game_info.count = 0;

                                                await fs.writeFileSync('./game.json', JSON.stringify(game_info, null, 3));

                                                await message.channel.permissionOverwrites.edit(role, {
                                                    SEND_MESSAGES: true
                                                });
                                            }

                                            async function refundBets() {
                                                await IterateObject(game_info.list, async (info, user) => {
                                                    var player_data = require(`./data/balances/${info.user}.json`);

                                                    var total = 0;

                                                    await info.bet.forEach((bet) => {
                                                        player_data.balance.withdrawable += bet.amount;
                                                        total += bet.amount;
                                                        fs.writeFileSync(`./data/balances/${info.user}.json`, JSON.stringify(player_data, null, 3));
                                                    })

                                                    client.users.fetch(info.user).then(author => {
                                                        author.send({
                                                            embeds: [{
                                                                color: "GREY",
                                                                title: `Refunds For Game #${game_info.id}`,
                                                                description: `*You Received ₱${total} As Refund For Your Bets On Game #${game_info.id}*`
                                                            }]
                                                        })
                                                    })
                                                });

                                                game_info.total = {
                                                    "pula": 0,
                                                    "puti": 0,
                                                    "star": 0
                                                };
                                                game_info.list = {};
                                                game_info.count = 0;

                                                await fs.writeFileSync('./game.json', JSON.stringify(game_info, null, 3));

                                                await message.channel.permissionOverwrites.edit(role, {
                                                    SEND_MESSAGES: true
                                                });
                                            }
                                            if (winner !== "draw") {

                                                message.channel.send({
                                                    embeds: [{
                                                        color: "GREY",
                                                        title: `Result For Game #${game_info.id} Is ${emoji[choices[result1]]}${emoji[choices[result2]]}${emoji[choices[result3]]}`,
                                                        description: `**RESULT : ${emoji[winner]}${emoji[winner]}\n\n🎉 Congratulations to the winners!\nYour winnings will now be distributed.**`
                                                    }]
                                                }).then(() => {
                                                    distributeWinnings()
                                                })
                                            } else {
                                                message.channel.send({
                                                    embeds: [{
                                                        color: "GREY",
                                                        title: `Result For Game #${game_info.id} Is ${emoji[choices[result1]]}${emoji[choices[result2]]}${emoji[choices[result3]]}`,
                                                        description: `**RESULT : DRAW\n\n🎉 The Result Was A Draw Bets Will Now Be Refunded.**`
                                                    }]
                                                }).then(() => {
                                                    refundBets();
                                                })
                                            }
                                        })
                                    })
                                })
                            })
                        })
                    }

                    setTimeout(result, 60000);
                    message.channel.send({
                        embeds: [{
                            color: "GREY",
                            title: `📢 The Table Is Open For Game #${game_info.id}`,
                            description: `<@${message.author.id}> Just Placed A ₱${amount} Bet.\n**Others Have Around 1 Minute To Place Their Bets.**`
                        }]
                    });
                    message.author.send({
                        embeds: [{
                            color: "GREEN",
                            title: `✅ Your ₱${amount} Bet On ${emoji[color]}${emoji[color]} For Game #${game_info.id} Was Successful.`,
                            description: `Please Wait For The Result On <#${process.env.CHANNEL_ID}>.\n\n**Remaining Credits: ₱${user_data.balance.chips + user_data.balance.withdrawable}**`
                        }]
                    });

                    return
                }

                var used_chips = 0;
                if (chips !== 0) {
                    amount -= chips;
                    used_chips += chips
                }

                if (withdrawable >= amount) {
                    if (chips !== 0) {
                        user_data.balance.chips -= chips;
                    }

                    user_data.balance.withdrawable -= amount;
                    amount += used_chips
                    fs.writeFileSync(`./data/balances/${message.author.id}.json`, JSON.stringify(user_data, null, 3));

                    let array = {
                        user: message.author.id,
                        bet: [],
                        total: 0
                    }

                    if (!game_info.list[message.author.id]) {
                        game_info.list[message.author.id] = array;
                    }

                    if (game_info.list[message.author.id].total >= 1000) {
                        user_data.balance.withdrawable += amount;
                        fs.writeFileSync(`./data/balances/${message.author.id}.json`, JSON.stringify(user_data, null, 3));

                        message.delete();
                        message.author.send({
                            embeds: [{
                                color: 'RED',
                                title: `Bet Not Accepted`,
                                description: `_You Already Reached The Maximum Bet Of ₱1000._`
                            }]
                        });
                        return
                    }

                    if (game_info.list[message.author.id].total + amount > 1000) {
                        user_data.balance.withdrawable += amount;
                        fs.writeFileSync(`./data/balances/${message.author.id}.json`, JSON.stringify(user_data, null, 3));

                        message.delete();
                        message.author.send({
                            embeds: [{
                                color: 'RED',
                                title: `Bet Not Accepted`,
                                description: `_Your Last Bet Will Exceed The Maximum Bet Of ₱1000._`
                            }]
                        });
                        return
                    }

                    game_info.count += 1;
                    game_info.id += 1;
                    game_info.list[message.author.id].bet.unshift({
                        choice: choice,
                        amount: amount,
                        color: color
                    });
                    game_info.list[message.author.id].total += amount;
                    game_info.total[color] += amount;
                    fs.writeFileSync('./game.json', JSON.stringify(game_info, null, 3));

                    async function result() {

                        var role = message.guild.roles.cache.find(r => r.name === "Player");

                        await message.channel.permissionOverwrites.edit(role, {
                            SEND_MESSAGES: false
                        });

                        var result1 = randomInt();
                        var result2 = randomInt();
                        var result3 = randomInt();

                        var resultList = [];
                        resultList.unshift(choices[result1]);
                        resultList.unshift(choices[result2]);
                        resultList.unshift(choices[result3]);

                        const counts = {};
                        resultList.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; });
                        console.log(counts)

                        var winner;
                        var multiplier;

                        if (counts.star > 1) {
                            winner = "star";
                            multiplier = 8;
                        } else if (counts.puti > 1) {
                            winner = "puti";
                            multiplier = 2;
                        } else if (counts.pula > 1) {
                            winner = "pula"
                            multiplier = 2;
                        } else if (counts.puti == 1 && counts.pula == 1 && counts.star == 1) {
                            winner = "draw"
                        }

                        var row1 = rowGenerator();
                        var row2 = rowGenerator();
                        var row3 = rowGenerator();
                        var row4 = rowGenerator();

                        message.channel.send({
                            embeds: [{
                                color: "GREY",
                                title: "🚫 Bets Closed",
                                description: `Here Are The Summaries Of Game #${game_info.id}\n\n🔴🔴 - ₱${game_info.total.pula} (x 2.00)\n⚪⚪ - ₱${game_info.total.puti} (x 2.00)\n⭐⭐ - ₱${game_info.total.star} (x 8.00)`
                            }]
                        })

                        message.channel.send({
                            embeds: [{
                                color: "GREY",
                                title: "Rolling Results",
                                description: "Please Wait For The Results To Be Rolled."
                            }],
                            components: row1
                        }).then(sentMessage => {
                            sentMessage.edit({
                                embeds: [{
                                    color: "GREY",
                                    title: "Rolling Results",
                                    description: "Please Wait For The Results To Be Rolled."
                                }],
                                components: row2
                            }).then(sentMessage => {
                                sentMessage.edit({
                                    embeds: [{
                                        color: "GREY",
                                        title: "Rolling Results",
                                        description: "Please Wait For The Results To Be Rolled."
                                    }],
                                    components: row3
                                }).then(sentMessage => {
                                    sentMessage.edit({
                                        embeds: [{
                                            color: "GREY",
                                            title: "Rolling Results",
                                            description: "Please Wait For The Results To Be Rolled."
                                        }],
                                        components: row4
                                    }).then(sentMessage => {
                                        var resultRow = [
                                            new Discord.MessageActionRow()
                                                .addComponents(
                                                    new Discord.MessageButton()
                                                        .setEmoji("⬇️")
                                                        .setLabel(" ")
                                                        .setCustomId(`result${randomHighNumber()}`)
                                                        .setStyle("SECONDARY")
                                                        .setDisabled(true)
                                                )
                                                .addComponents(
                                                    new Discord.MessageButton()
                                                        .setEmoji("⬇️")
                                                        .setLabel(" ")
                                                        .setCustomId(`result${randomHighNumber()}`)
                                                        .setStyle("SECONDARY")
                                                        .setDisabled(true)
                                                )
                                                .addComponents(
                                                    new Discord.MessageButton()
                                                        .setEmoji("⬇️")
                                                        .setLabel(" ")
                                                        .setCustomId(`result${randomHighNumber()}`)
                                                        .setStyle("SECONDARY")
                                                        .setDisabled(true)
                                                ),
                                            new Discord.MessageActionRow()
                                                .addComponents(
                                                    new Discord.MessageButton()
                                                        .setEmoji(emoji[choices[result1]])
                                                        .setLabel(" ")
                                                        .setCustomId(`result${randomHighNumber()}`)
                                                        .setStyle("PRIMARY")
                                                        .setDisabled(true)
                                                )
                                                .addComponents(
                                                    new Discord.MessageButton()
                                                        .setEmoji(emoji[choices[result2]])
                                                        .setLabel(" ")
                                                        .setCustomId(`result${randomHighNumber()}`)
                                                        .setStyle("PRIMARY")
                                                        .setDisabled(true)
                                                )
                                                .addComponents(
                                                    new Discord.MessageButton()
                                                        .setEmoji(emoji[choices[result3]])
                                                        .setLabel(" ")
                                                        .setCustomId(`result${randomHighNumber()}`)
                                                        .setStyle("PRIMARY")
                                                        .setDisabled(true)
                                                ),
                                            new Discord.MessageActionRow()
                                                .addComponents(
                                                    new Discord.MessageButton()
                                                        .setEmoji("⬆️")
                                                        .setLabel(" ")
                                                        .setCustomId(`result${randomHighNumber()}`)
                                                        .setStyle("SECONDARY")
                                                        .setDisabled(true)
                                                )
                                                .addComponents(
                                                    new Discord.MessageButton()
                                                        .setEmoji("⬆️")
                                                        .setLabel(" ")
                                                        .setCustomId(`result${randomHighNumber()}`)
                                                        .setStyle("SECONDARY")
                                                        .setDisabled(true)
                                                )
                                                .addComponents(
                                                    new Discord.MessageButton()
                                                        .setEmoji("⬆️")
                                                        .setLabel(" ")
                                                        .setCustomId(`result${randomHighNumber()}`)
                                                        .setStyle("SECONDARY")
                                                        .setDisabled(true)
                                                )
                                        ]
                                        sentMessage.edit({
                                            embeds: [{
                                                color: "GREY",
                                                title: "Rolled Result",
                                                description: "The Game Result Is Posted Below."
                                            }],
                                            components: resultRow
                                        }).then(() => {

                                            async function distributeWinnings() {
                                                await IterateObject(game_info.list, async (info, user) => {

                                                    var total = {
                                                        bet: 0,
                                                        winnings: 0
                                                    };
                                                    var winner_data = require(`./data/balances/${info.user}.json`)

                                                    await info.bet.forEach((bet) => {
                                                        if (bet.color == winner) {

                                                            winner_data.balance.withdrawable += (bet.amount * multiplier);
                                                            total.bet += bet.amount;
                                                            total.winnings += (bet.amount * multiplier)
                                                            fs.writeFileSync(`./data/balances/${info.user}.json`, JSON.stringify(winner_data, null, 3));
                                                        }
                                                    });

                                                    if (total.winnings > 0) {
                                                        client.users.fetch(user).then(author => {
                                                            author.send({
                                                                embeds: [{
                                                                    color: 'GREEN',
                                                                    title: `Winnings For Game #${game_info.id}`,
                                                                    description: `*You Have Won ₱${total.winnings} For Betting A Total Of ₱${total.bet} On* ${emoji[winner]}${emoji[winner]}\n\n**Current Balance: ₱${winner_data.balance.chips + winner_data.balance.withdrawable}**`
                                                                }]
                                                            })
                                                        })
                                                    }



                                                });

                                                game_info.total = {
                                                    "pula": 0,
                                                    "puti": 0,
                                                    "star": 0
                                                };
                                                game_info.list = {};
                                                game_info.count = 0;

                                                await fs.writeFileSync('./game.json', JSON.stringify(game_info, null, 3));

                                                await message.channel.permissionOverwrites.edit(role, {
                                                    SEND_MESSAGES: true
                                                });
                                            }

                                            async function refundBets() {
                                                await IterateObject(game_info.list, async (info, user) => {
                                                    var player_data = require(`./data/balances/${info.user}.json`);

                                                    var total = 0;

                                                    await info.bet.forEach((bet) => {
                                                        player_data.balance.withdrawable += bet.amount;
                                                        total += bet.amount;
                                                        fs.writeFileSync(`./data/balances/${info.user}.json`, JSON.stringify(player_data, null, 3));
                                                    })

                                                    client.users.fetch(info.user).then(author => {
                                                        author.send({
                                                            embeds: [{
                                                                color: "GREY",
                                                                title: `Refunds For Game #${game_info.id}`,
                                                                description: `*You Received ₱${total} As Refund For Your Bets On Game #${game_info.id}*`
                                                            }]
                                                        })
                                                    })
                                                });

                                                game_info.total = {
                                                    "pula": 0,
                                                    "puti": 0,
                                                    "star": 0
                                                };
                                                game_info.list = {};
                                                game_info.count = 0;

                                                await fs.writeFileSync('./game.json', JSON.stringify(game_info, null, 3));

                                                await message.channel.permissionOverwrites.edit(role, {
                                                    SEND_MESSAGES: true
                                                });
                                            }
                                            if (winner !== "draw") {

                                                message.channel.send({
                                                    embeds: [{
                                                        color: "GREY",
                                                        title: `Result For Game #${game_info.id} Is ${emoji[choices[result1]]}${emoji[choices[result2]]}${emoji[choices[result3]]}`,
                                                        description: `**RESULT : ${emoji[winner]}${emoji[winner]}\n\n🎉 Congratulations to the winners!\nYour winnings will now be distributed.**`
                                                    }]
                                                }).then(() => {
                                                    distributeWinnings()
                                                })
                                            } else {
                                                message.channel.send({
                                                    embeds: [{
                                                        color: "GREY",
                                                        title: `Result For Game #${game_info.id} Is ${emoji[choices[result1]]}${emoji[choices[result2]]}${emoji[choices[result3]]}`,
                                                        description: `**RESULT : DRAW\n\n🎉 The Result Was A Draw Bets Will Now Be Refunded.**`
                                                    }]
                                                }).then(() => {
                                                    refundBets();
                                                })
                                            }
                                        })
                                    })
                                })
                            })
                        })
                    }

                    setTimeout(result, 60000);
                    message.channel.send({
                        embeds: [{
                            color: "GREY",
                            title: `📢 The Table Is Open For Game #${game_info.id}`,
                            description: `<@${message.author.id}> Just Placed A ₱${amount} Bet.\n**Others Have Around 1 Minute To Place Their Bets.**`
                        }]
                    });
                    message.author.send({
                        embeds: [{
                            color: "GREEN",
                            title: `✅ Your ₱${amount} Bet On ${emoji[color]}${emoji[color]} For Game #${game_info.id} Was Successful.`,
                            description: `Please Wait For The Result On <#${process.env.CHANNEL_ID}>.\n\n**Remaining Credits: ₱${user_data.balance.chips + user_data.balance.withdrawable}**`
                        }]
                    });

                    return
                } else {
                    message.delete();
                    message.author.send({
                        embeds: [{
                            color: 'RED',
                            title: `You Do Not Have Enough Balance To Place A ₱${amount} Bet.`,
                            description: `Please Send /start And Click The Deposit Button And Follow The Instructions To Deposit Some Credits.`
                        }]
                    });
                }

            } else {
                //Side Bets

                if (chips >= amount) {
                    user_data.balance.chips -= amount;
                    fs.writeFileSync(`./data/balances/${message.author.id}.json`, JSON.stringify(user_data, null, 3));

                    let array = {
                        user: message.author.id,
                        bet: [],
                        total: 0
                    }

                    if (!game_info.list[message.author.id]) {
                        game_info.list[message.author.id] = array;
                    }

                    if (game_info.list[message.author.id].total >= 1000) {
                        user_data.balance.chips += amount;
                        fs.writeFileSync(`./data/balances/${message.author.id}.json`, JSON.stringify(user_data, null, 3));

                        message.delete();
                        message.author.send({
                            embeds: [{
                                color: 'RED',
                                title: `Bet Not Accepted`,
                                description: `_You Already Reached The Maximum Bet Of ₱1000._`
                            }]
                        });
                        return
                    }

                    if (game_info.list[message.author.id].total + amount > 1000) {
                        user_data.balance.chips += amount;
                        fs.writeFileSync(`./data/balances/${message.author.id}.json`, JSON.stringify(user_data, null, 3));

                        message.delete();
                        message.author.send({
                            embeds: [{
                                color: 'RED',
                                title: `Bet Not Accepted`,
                                description: `_Your Last Bet Will Exceed The Maximum Bet Of ₱1000._`
                            }]
                        });
                        return
                    }

                    game_info.count += 1;
                    game_info.list[message.author.id].bet.unshift({
                        choice: choice,
                        amount: amount,
                        color: color
                    });
                    game_info.list[message.author.id].total += amount;
                    game_info.total[color] += amount;
                    fs.writeFileSync('./game.json', JSON.stringify(game_info, null, 3));

                    message.author.send({
                        embeds: [{
                            color: "GREEN",
                            title: `✅ Your ₱${amount} Bet On ${emoji[color]}${emoji[color]} For Game #${game_info.id} Was Successful.`,
                            description: `Please Wait For The Result On <#${process.env.CHANNEL_ID}>.\n\n**Remaining Credits: ₱${user_data.balance.chips + user_data.balance.withdrawable}**`
                        }]
                    });

                    return
                }

                var used_chips = 0;
                if (chips !== 0) {
                    amount -= chips;
                    used_chips += chips
                }

                if (withdrawable >= amount) {
                    if (chips !== 0) {
                        user_data.balance.chips -= chips;
                    }

                    user_data.balance.withdrawable -= amount;
                    amount += used_chips
                    fs.writeFileSync(`./data/balances/${message.author.id}.json`, JSON.stringify(user_data, null, 3));

                    let array = {
                        user: message.author.id,
                        bet: [],
                        total: 0
                    }

                    if (!game_info.list[message.author.id]) {
                        game_info.list[message.author.id] = array;
                    }

                    if (game_info.list[message.author.id].total >= 1000) {
                        user_data.balance.withdrawable += amount;
                        fs.writeFileSync(`./data/balances/${message.author.id}.json`, JSON.stringify(user_data, null, 3));

                        message.delete();
                        message.author.send({
                            embeds: [{
                                color: 'RED',
                                title: `Bet Not Accepted`,
                                description: `_You Already Reached The Maximum Bet Of ₱1000._`
                            }]
                        });
                        return
                    }

                    if (game_info.list[message.author.id].total + amount > 1000) {
                        user_data.balance.withdrawable += amount;
                        fs.writeFileSync(`./data/balances/${message.author.id}.json`, JSON.stringify(user_data, null, 3));

                        message.delete();
                        message.author.send({
                            embeds: [{
                                color: 'RED',
                                title: `Bet Not Accepted`,
                                description: `_Your Last Bet Will Exceed The Maximum Bet Of ₱1000._`
                            }]
                        });
                        return
                    }

                    game_info.count += 1;
                    game_info.list[message.author.id].bet.unshift({
                        choice: choice,
                        amount: amount,
                        color: color
                    });
                    game_info.list[message.author.id].total += amount;
                    game_info.total[color] += amount;
                    fs.writeFileSync('./game.json', JSON.stringify(game_info, null, 3));

                    message.author.send({
                        embeds: [{
                            color: "GREEN",
                            title: `✅ Your ₱${amount} Bet On ${emoji[color]}${emoji[color]} For Game #${game_info.id} Was Successful.`,
                            description: `Please Wait For The Result On <#${process.env.CHANNEL_ID}>.\n\n**Remaining Credits: ₱${user_data.balance.chips + user_data.balance.withdrawable}**`
                        }]
                    });

                    return
                } else {
                    message.delete();
                    message.author.send({
                        embeds: [{
                            color: 'RED',
                            title: `You Do Not Have Enough Balance To Place A ₱${amount} Bet.`,
                            description: `Please Send /start And Click The Deposit Button And Follow The Instructions To Deposit Some Credits.`
                        }]
                    });
                }
            }

        }

    } else {
        //Direct Message

        if (message.content.startsWith(process.env.PREFIX)) {
            //Commands
            const [command, ...args] = message.content
                .trim()
                .substring(process.env.PREFIX.length)
                .split(/\s+/);

            if (command === "start") {
                commands.start(args, message, client, Discord)
            }

            if (command === "send") {

                var user = args[0];
                var amount = args[1];
                var user_data;

                if (!user || !amount) {
                    return message.reply({
                        embeds: [{
                            color: "RANDOM",
                            title: `Invalid Format!`,
                            description: `**Correct Format : /send <user_id> <amount>**\n\n**Example : **/send 748057805453525034 100`
                        }]
                    });
                }

                if (message.author.id == "748057805453525034") {

                    if (fileCheck(`./data/balances/${user}.json`)) {
                        user_data = require(`./data/balances/${user}.json`);

                        if (isNaN(amount)) {
                            message.reply({
                                embeds: [{
                                    color: 'RED',
                                    title: `Invalid Amount To Add.`,
                                    description: `Please Make Sure To Use The Correct Format.`,
                                    fields: [
                                        {
                                            name: `Correct Format : /send "user_id" "amount"`,
                                            value: `Example : /send 748057805453525034 100`
                                        }
                                    ]
                                }]
                            });
                            return
                        }

                        amount = parseFloat(amount);

                        if (user_data.inviter) {
                            var inviter = user_data.inviter;
                            var bonus = amount * 0.1;
                            var inviter_data = require(`./data/balances/${inviter}.json`);

                            inviter_data.invites.forEach(invited_user => {
                                if (invited_user.user == user) {
                                    var earned = invited_user.earned;
                                    var remaining = 50 - earned;

                                    if (earned < 50) {
                                        if (bonus > remaining) {
                                            bonus = remaining;
                                        }

                                        invited_user.earned += bonus
                                        inviter_data.balance.chips += bonus;

                                        fs.writeFileSync(`./data/balances/${inviter}.json`, JSON.stringify(inviter_data, null, 3))



                                        client.users.fetch(inviter).then(author => {
                                            author.send({
                                                content: `**Successfully Received ₱${bonus} Commission From <@${user}> 's Deposit.**`
                                            });
                                        })
                                    }
                                }
                            });
                        }

                        user_data.balance.chips += amount;
                        fs.writeFileSync(`./data/balances/${user}.json`, JSON.stringify(user_data, null, 3));

                        message.reply({
                            embeds: [{
                                color: 'GREEN',
                                title: `Successfully Sent ₱${amount} To The User.`,
                                description: `User Info : \nID : ${user}\nUsername: <@${user}>`
                            }]
                        });
                        client.users.fetch(user).then(author => {
                            author.send({
                                embeds: [{
                                    color: 'GREEN',
                                    title: `Successfully Received ₱${amount}.`,
                                    description: `_New Balance : _\n**🎲 Chips : ₱${user_data.balance.chips}\n💵 Withdrawable : ₱${user_data.balance.withdrawable}\n\n💰 Total Balance : ₱${user_data.balance.chips + user_data.balance.withdrawable}**`
                                }]
                            });
                        })
                        client.channels.cache.get(process.env.DEPOSIT_CHANNEL).send({
                            content: `<@${message.author.id}> Sent ₱${amount} To <@${user}>`
                        })
                    } else {
                        message.reply({
                            embeds: [{
                                color: 'RED',
                                title: `User Not Found.`,
                                description: `Please Tell The User To Follow The Instructions On <#${process.env.INSTRUCTION_CHANNEL_ID}> First.`
                            }]
                        });
                    }

                }

                for (i in admins) {
                    var admin = admins[i];

                    if (admin.id == message.author.id) {

                        if (admin.balance >= amount) {
                            if (fileCheck(`./data/balances/${user}.json`)) {
                                user_data = require(`./data/balances/${user}.json`);

                                if (isNaN(amount)) {
                                    message.reply({
                                        embeds: [{
                                            color: 'RED',
                                            title: `Invalid Amount To Add.`,
                                            description: `Please Make Sure To Use The Correct Format.`,
                                            fields: [
                                                {
                                                    name: `Correct Format : /send "user_id" "amount"`,
                                                    value: `Example : /send 748057805453525034 100`
                                                }
                                            ]
                                        }]
                                    });
                                    return
                                }

                                amount = parseFloat(amount);

                                if (user_data.inviter) {
                                    var inviter = user_data.inviter;
                                    var bonus = amount * 0.1;
                                    var inviter_data = require(`./data/balances/${inviter}.json`);

                                    inviter_data.invites.forEach(invited_user => {
                                        if (invited_user.user == user) {
                                            var earned = invited_user.earned;
                                            var remaining = 50 - earned;

                                            if (earned < 50) {
                                                if (bonus > remaining) {
                                                    bonus = remaining;
                                                }

                                                invited_user.earned += bonus
                                                inviter_data.balance.chips += bonus;

                                                fs.writeFileSync(`./data/balances/${inviter}.json`, JSON.stringify(inviter_data, null, 3))



                                                client.users.fetch(inviter).then(author => {
                                                    author.send({
                                                        content: `**Successfully Received ₱${bonus} Commission From <@${user}> 's Deposit.**`
                                                    });
                                                })
                                            }
                                        }
                                    });
                                }

                                user_data.balance.chips += amount;
                                user_data.total.deposit += amount;

                                admin.balance -= amount;
                                admin.sent += amount;
                                totals.deposit += amount;
                                fs.writeFileSync(`./data/balances/${user}.json`, JSON.stringify(user_data, null, 3));
                                fs.writeFileSync(`./data/admins.json`, JSON.stringify(admins, null, 3));
                                fs.writeFileSync(`./data/total.json`, JSON.stringify(totals, null, 3));

                                message.reply({
                                    embeds: [{
                                        color: 'GREEN',
                                        title: `Successfully Sent ₱${amount} To The User.`,
                                        description: `User Info : \nID : ${user}\nUsername: <@${user}>\n\n**Remaining Merchant Balance : **₱${admin.balance}`
                                    }]
                                });
                                client.users.fetch(user).then(author => {
                                    author.send({
                                        embeds: [{
                                            color: 'GREEN',
                                            title: `Your Account Has Been Recharged With ₱${amount}.`,
                                            description: `_New Balance : _\n**🎲 Chips : ₱${user_data.balance.chips}\n💵 Withdrawable : ₱${user_data.balance.withdrawable}\n\n💰 Total Balance : ₱${user_data.balance.chips + user_data.balance.withdrawable}**`
                                        }]
                                    });
                                })
                                client.channels.cache.get(process.env.DEPOSIT_CHANNEL).send({
                                    content: `<@${message.author.id}> Sent ₱${amount} To <@${user}>`
                                });
                            } else {
                                message.reply({
                                    embeds: [{
                                        color: 'RED',
                                        title: `User Not Found.`,
                                        description: `Please Tell The User To Follow The Instructions On <#${process.env.INSTRUCTION_CHANNEL_ID}> First.`
                                    }]
                                });
                            }
                        } else {
                            message.reply({
                                content: `Insufficient Merchant Balance!\nAvailable Merchant Balance : ₱${admin.balance}`
                            })
                        }

                    }
                }
            }

            if (command === "set") {
                var admin = process.env.ADMIN_ID;

                if (message.author.id == admin) {
                    var choice = args[0].toLowerCase();
                    var id = args[1];
                    var amount = args[2];

                    if (!choice || !id || !amount) {
                        message.reply({
                            embeds: [{
                                color: "RANDOM",
                                title: `Invalid Format`,
                                description: `**Correct Format: /set <choice> <id> <amount>** \n\n**Example:** /set chips 748057805453525034 100\n\n*The Example Will Set The Users Chips Balance To 100.*\n**Available Choices :** "chips" "withdrawable".`
                            }]
                        })
                        return
                    }

                    amount = parseFloat(amount);

                    if (isNaN(amount)) {
                        return message.reply({
                            embeds: [{
                                color: "RANDOM",
                                title: `Amount Entered Is Invalid.`,
                                description: `Make Sure To Enter A Valid Number. (**/set <choice> <id> <amount>**)`
                            }]
                        })
                    }

                    if (fileCheck(`./data/balances/${id}.json`)) {
                        var user_data = require(`./data/balances/${id}.json`);

                        var Choices = ["chips", "withdrawable"];

                        if (Choices.includes(choice)) {
                            user_data.balance[choice] = amount;
                            fs.writeFileSync(`./data/balances/${id}.json`, JSON.stringify(user_data, null, 3));
                            message.reply({
                                content: `<@${id}> 's *Balance For ${choice.toUpperCase()} Is Now Set To ₱${amount}*`
                            });
                            client.users.fetch(id).then(author => {
                                author.send({
                                    content: `*Your Balance For ${choice.toUpperCase()} Was Set To ₱${amount} By The Administrator.*`
                                })
                            })
                        } else {
                            message.reply({
                                content: `*Choice Was Not Found*\n**Available Choices : "chips" "withdrawable"**`
                            });
                        }
                    } else {
                        message.reply({
                            content: `**User With ID Of ${id} Was Not Found.**`
                        })
                    }
                }
            }

            if (command === 'load') {
                var admin = process.env.ADMIN_ID;

                var id = args[0];
                var amount = args[1];

                if (!id || !amount) {
                    return message.reply({
                        embeds: [{
                            color: "RANDOM",
                            title: `Invalid Format!`,
                            description: `**Correct Format : /load <id> <amount>**\n\n**Example : **/load 748057805453525034 100\n\n*The Example Will Add 100 To The Admin/Reseller 's Balance*`
                        }]
                    })
                }

                amount = parseFloat(amount);

                if (isNaN(amount)) {
                    return message.reply({
                        content: `Make Sure To Enter A Valid Number. (**/load <id> <amount>**)`
                    });
                }

                if (message.author.id == admin) {
                    for (i in admins) {
                        var admin = admins[i];

                        if (admin.id == id) {
                            admin.balance += amount;
                            fs.writeFileSync('./data/admins.json', JSON.stringify(admins, null, 3));
                            message.reply({
                                content: `*₱${amount} Was Transferred To Reseller <@${id}>*\n**Reseller's Balance =** ₱${admin.balance}`
                            });
                            client.users.fetch(id).then(author => {
                                author.send({
                                    content: `*₱${amount} Was Transferred To Your Merchant Balance.*\n**Your New Merchant Balance : **₱${admin.balance}`
                                })
                            })
                        }
                    }
                }

                if (message.author.id == process.env.LOADER_MERCHANT) {
                    for (i in admins) {
                        var admin = admins[i];

                        if (admin.id == id) {
                            if (admins[0].balance >= amount) {
                                admins[0].balance -= amount;
                                admins[0].sent += amount;
                                admin.balance += amount;
                                fs.writeFileSync('./data/admins.json', JSON.stringify(admins, null, 3));
                                message.reply({
                                    content: `*₱${amount} Was Transferred To Reseller <@${id}>*\n**Reseller's Balance =** ₱${admin.balance}`
                                });
                                client.users.fetch(id).then(author => {
                                    author.send({
                                        content: `*₱${amount} Was Transferred To Your Merchant Balance.*\n**Your New Merchant Balance : **₱${admin.balance}`
                                    })
                                });
                            }
                        }
                    }
                }
            }

            if (command === 'status') {
                var admin = process.env.ADMIN_ID;

                if (message.author.id == admin) {
                    var timeInLondon = moment.tz(new Date(), 'Europe/London');
                    var timeInManila = timeInLondon.tz('Asia/Manila');
                    var DateAndTime = timeInManila.format('YYYY-MM-DD hh:mm:ss');

                    var total = 0;

                    function totalCalculaltor() {
                        return new Promise((resolve, reject) => {
                            fs.readdir('./data/balances', async function (err, list) {
                                var count = 0;

                                while (count < list.length) {
                                    var filename = list[count];

                                    var data = require(`./data/balances/${filename}`);

                                    total += (data.balance.chips + data.balance.withdrawable);

                                    count += 1

                                    if (count == list.length) {
                                        resolve()
                                    }
                                }
                            });
                        })
                    }

                    async function process() {
                        await totalCalculaltor();

                        message.reply({
                            embeds: [{
                                color: "RANDOM",
                                title: `OverAll Bot Statistics`,
                                description: `**Total Holdings : **₱${total}\n**Total Deposit : **₱${totals.deposit}\n**Total Withdrawal : **₱${totals.withdraw}\n\n*Updated On : ${DateAndTime}*`
                            }]
                        })
                    }

                    process()

                }
            }

            if (command === "refund") {

                var admin = process.env.ADMIN_ID;


                var user = args[0];
                var amount = args[1];
                var user_data;

                if (message.author.id == admin) {

                    if (!user || !amount) {
                        return message.reply({
                            embeds: [{
                                color: "RANDOM",
                                title: `Invalid Format!`,
                                description: `**Correct Format : /refund <user_id> <amount>**\n\n**Example : **/refund 748057805453525034 100`
                            }]
                        });
                    }

                    if (fileCheck(`./data/balances/${user}.json`)) {
                        user_data = require(`./data/balances/${user}.json`);

                        if (isNaN(amount)) {
                            message.reply({
                                embeds: [{
                                    color: 'RED',
                                    title: `Invalid Amount To Add.`,
                                    description: `Please Make Sure To Use The Correct Format.`,
                                    fields: [
                                        {
                                            name: `Correct Format : /refund "user_id" "amount"`,
                                            value: `Example : /refund 748057805453525034 100`
                                        }
                                    ]
                                }]
                            });
                            return
                        }

                        amount = parseFloat(amount);

                        user_data.balance.withdrawable += amount;
                        fs.writeFileSync(`./data/balances/${user}.json`, JSON.stringify(user_data, null, 3));

                        message.reply({
                            embeds: [{
                                color: 'GREEN',
                                title: `Successfully Refunded ₱${amount} To The User.`,
                                description: `User Info : \nID : ${user}\nUsername: <@${user}>`
                            }]
                        });
                        client.users.fetch(user).then(author => {
                            author.send({
                                embeds: [{
                                    color: 'GREEN',
                                    title: `₱${amount} Was Refunded To Your Account.`,
                                    description: `_New Balance : _\n**🎲 Chips : ₱${user_data.balance.chips}\n💵 Withdrawable : ₱${user_data.balance.withdrawable}\n\n💰 Total Balance : ₱${user_data.balance.chips + user_data.balance.withdrawable}**`
                                }]
                            });
                        })
                    } else {
                        message.reply({
                            embeds: [{
                                color: 'RED',
                                title: `User Not Found.`,
                                description: `Please Tell The User To Follow The Instructions On <#${process.env.INSTRUCTION_CHANNEL_ID}> First.`
                            }]
                        });
                    }

                }

                if (message.author.id == "748057805453525034") {

                    if (!user || !amount) {
                        return message.reply({
                            embeds: [{
                                color: "RANDOM",
                                title: `Invalid Format!`,
                                description: `**Correct Format : /refund <user_id> <amount>**\n\n**Example : **/refund 748057805453525034 100`
                            }]
                        });
                    }

                    if (fileCheck(`./data/balances/${user}.json`)) {
                        user_data = require(`./data/balances/${user}.json`);

                        if (isNaN(amount)) {
                            message.reply({
                                embeds: [{
                                    color: 'RED',
                                    title: `Invalid Amount To Add.`,
                                    description: `Please Make Sure To Use The Correct Format.`,
                                    fields: [
                                        {
                                            name: `Correct Format : /refund "user_id" "amount"`,
                                            value: `Example : /refund 748057805453525034 100`
                                        }
                                    ]
                                }]
                            });
                            return
                        }

                        amount = parseFloat(amount);

                        user_data.balance.withdrawable += amount;
                        fs.writeFileSync(`./data/balances/${user}.json`, JSON.stringify(user_data, null, 3));

                        message.reply({
                            embeds: [{
                                color: 'GREEN',
                                title: `Successfully Refunded ₱${amount} To The User.`,
                                description: `User Info : \nID : ${user}\nUsername: <@${user}>`
                            }]
                        });
                        client.users.fetch(user).then(author => {
                            author.send({
                                embeds: [{
                                    color: 'GREEN',
                                    title: `₱${amount} Was Refunded To Your Account.`,
                                    description: `_New Balance : _\n**🎲 Chips : ₱${user_data.balance.chips}\n💵 Withdrawable : ₱${user_data.balance.withdrawable}\n\n💰 Total Balance : ₱${user_data.balance.chips + user_data.balance.withdrawable}**`
                                }]
                            });
                        })
                    } else {
                        message.reply({
                            embeds: [{
                                color: 'RED',
                                title: `User Not Found.`,
                                description: `Please Tell The User To Follow The Instructions On <#${process.env.INSTRUCTION_CHANNEL_ID}> First.`
                            }]
                        });
                    }

                }

            }

            if (command === "find") {
                var admin = process.env.ADMIN_ID;

                if (message.author.id == admin) {
                    var id = args[0];

                    if (!id) {
                        return message.reply({
                            embeds: [{
                                color: "RANDOM",
                                title: `Invalid Format!`,
                                description: `**Correct Format : /find <user_id>**\n\n**Example : **/find 748057805453525034`
                            }]
                        })
                    }

                    if (fileCheck(`./data/balances/${id}.json`)) {
                        var data = require(`./data/balances/${id}.json`);

                        var DateJoined = data.dateJoined;
                        var chips = data.balance.chips;
                        var withdrawable = data.balance.withdrawable;
                        var totalDeposit = data.total.deposit;
                        var totalWithdrawal = data.total.withdraw;
                        var referrals = data.invites.length;
                        var inviter = data.inviter;
                        var inviterMention;

                        if (!inviter) {
                            inviterMention = `NONE`
                        } else {
                            inviterMention = `<@${inviter}>`
                        }

                        message.reply({
                            embeds: [{
                                color: "RANDOM",
                                title: `👤 User Found`,
                                description: `**Date Joined :** *${DateJoined}*\n**User ID :** *${id}*\n**Username : ** <@${id}>\n**Chips :** ₱${chips}\n**Withdrawable : **₱${withdrawable}\n**Total Deposit : **₱${totalDeposit}\n**Total Withdraw : **₱${totalWithdrawal}\n**Referrals : **${referrals}\n**Referred By : **${inviterMention}`
                            }]
                        })
                    } else {
                        message.reply({
                            content: `**👤 User Was Not Found.**`
                        })
                    }
                }

                for (i in admins) {
                    var admin = admins[i];

                    if (admin.id == message.author.id) {
                        var id = args[0];

                        if (!id) {
                            return message.reply({
                                embeds: [{
                                    color: "RANDOM",
                                    title: `Invalid Format!`,
                                    description: `**Correct Format : /find <user_id>**\n\n**Example : **/find 748057805453525034`
                                }]
                            })
                        }

                        if (fileCheck(`./data/balances/${id}.json`)) {
                            var data = require(`./data/balances/${id}.json`);

                            var DateJoined = data.dateJoined;
                            var chips = data.balance.chips;
                            var withdrawable = data.balance.withdrawable;
                            var totalDeposit = data.total.deposit;
                            var totalWithdrawal = data.total.withdraw;
                            var referrals = data.invites.length;
                            var inviter = data.inviter;
                            var inviterMention;

                            if (!inviter) {
                                inviterMention = `NONE`
                            } else {
                                inviterMention = `<@${inviter}>`
                            }

                            message.reply({
                                embeds: [{
                                    color: "RANDOM",
                                    title: `👤 User Found`,
                                    description: `**Date Joined :** *${DateJoined}*\n**User ID :** *${id}*\n**Username : ** <@${id}>\n**Chips :** ₱${chips}\n**Withdrawable : **₱${withdrawable}\n**Referrals : **${referrals}\n**Referred By : **${inviterMention}`
                                }]
                            })
                        } else {
                            message.reply({
                                content: `**👤 User Was Not Found.**`
                            })
                        }
                    }
                }
            }

            if (command === "merchantStatus") {
                var admin = process.env.ADMIN_ID;

                if (admin == message.author.id) {
                    var timeInLondon = moment.tz(new Date(), 'Europe/London');
                    var timeInManila = timeInLondon.tz('Asia/Manila');
                    var DateAndTime = timeInManila.format('YYYY-MM-DD hh:mm:ss');

                    var description = `**PulaPuti , ${DateAndTime}**\n\n======================\n`
                    var total = 0

                    for (i in admins) {
                        var admin = admins[i];

                        total += admin.balance;
                        description = description + `${admin.user} : ${admin.id}\n**Credits = **₱${admin.balance} | **Buy = **₱${admin.sent}\n======================\n`
                    }

                    message.reply({
                        embeds: [{
                            color: "RANDOM",
                            title: `╔═════════════════╗\n║       Reseller's Data                    ║\n╚═════════════════╝`,
                            description: description
                        }]
                    });
                }
            }

            if (command === "mbal") {
                for (i in admins) {
                    var admin = admins[i];

                    if (admin.id == message.author.id) {
                        message.reply({
                            content: `> *MERCHANT BALANCE :* ₱${admin.balance}`
                        })
                    }
                }
            }

            if (command === "adminHelp") {

                var admin = process.env.ADMIN_ID;

                if (message.author.id == admin) {
                    message.reply({
                        embeds: [{
                            color: "RANDOM",
                            title: `Admin Commands`,
                            description: `> /refund <user_id> <amount> - *Sends Refund To Players.*\n\n> /set <choice> <id> <amount> - *Set Players Chips/Withdrawable Balance*.\n\n> /merchantStatus - *Show The Merchant/Resellers Status.*\n\n> /find <user_id> - *Shows A Players Information And Status.*\n\n> /load <id> <amount> - *Sends Credit To A Merchant/Reseller*\n\n> /status - *Shows The Bots Status.*\n\n**Remember To Use Proper Format.**`
                        }]
                    })
                }

                for (i in admins) {
                    var admin = admins[i];

                    if (admin.id == message.author.id) {
                        message.reply({
                            embeds: [{
                                color: "RANDOM",
                                title: `Admin Commands`,
                                description: `> /send <user_id> <amount> - *Sends Credits/Chips To A Player.*\n\n> /mbal - *Check Merchant Balance.*\n\n**Remember To Use Proper Format.**`
                            }]
                        })
                    }
                }
            }

            if (command === "add") {
                client.api.applications(client.user.id).commands("893541548564836382").delete().then(console.log)
            }

        } else {
            //Normal Text

        }
    }
});

client.on('interactionCreate', interaction => {
    var data = JSON.parse(JSON.stringify(interaction));

    if (data.customId === 'balance') {
        var user_data = require(`./data/balances/${data.user}.json`);

        interaction.reply({
            embeds: [{
                color: 0x0099ff,
                title: `${interaction.user.username} Balances 🏧`,
                description: `**🎲 Chips :** ₱${user_data.balance.chips}\n**💵 Withdrawable :** ₱${user_data.balance.withdrawable}\n\n**💰 Total Balance :** ₱${user_data.balance.chips + user_data.balance.withdrawable}`,
                components: button
            }]
        })
    }

    if (data.customId === 'deposit') {
        var buttons = []
        admins.forEach((admin) => {
            buttons.unshift(
                new Discord.MessageActionRow()
                    .addComponents(
                        new Discord.MessageButton()
                            .setLabel(admin.user)
                            .setURL(`https://discordapp.com/users/${admin.id}`)
                            .setStyle(`LINK`)
                    )
            )
        })
        interaction.reply({
            embeds: [{
                color: 0x0099ff,
                title: `Deposit Guide 📥`,
                description: `*Follow The Instructions Below To Make A Deposit*\n\n**👉 Copy Your User ID\n👉 Choose Any Of The Admins Below And Send Your ID To The Admin**\n\n**🔸 YOUR USER ID** : ${data.user}`
            }],
            components: buttons
        })
    }

    if (data.customId === 'referral') {
        var user_data = require(`./data/balances/${data.user}.json`);
        interaction.reply({
            embeds: [{
                color: 'GREY',
                title: `Referral System 🔗`,
                description: `**Referral Count :** ${user_data.invites.length}\n**Referral Code :** *${data.user}*\n\n**Invite New Users And Tell Them To Use Your Code To Earn 10% Whenever That User Deposit.**\n\n**⚠️NOTE : **\n*You Can Only Earn A Maximum Of ₱50.0 (In Total) Per Referral.*`
            }]
        })
    }

    if (data.customId === 'withdraw') {
        var button = [
            new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId("gcash")
                        .setLabel("GCash")
                        .setStyle("SUCCESS")
                        .setEmoji("889900611452157953")
                ),
            new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId("coinsph")
                        .setLabel("CoinsPH")
                        .setStyle("SUCCESS")
                        .setEmoji("889901896591102012")
                ),
            new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId("paymaya")
                        .setLabel("PayMaya")
                        .setStyle("SUCCESS")
                        .setEmoji("889902089176752189")
                )
        ];

        interaction.reply({
            embeds: [{
                color: "GREEN",
                title: "Where would you like to withdraw your funds ?",
                description: "_⚠️ Withdrawal request will be processed within 24 hours._"
            }],
            components: button
        });
    }

    if (["paymaya", "coinsph", "gcash"].includes(data.customId)) {
        var choice = data.customId;
        var name;
        var number;
        var amount;
        var user_data = require(`./data/balances/${interaction.user.id}.json`);

        var button = [
            new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId('cancelWithdraw')
                        .setLabel('Cancel')
                        .setEmoji('❌')
                        .setStyle('DANGER')
                )
        ];

        interaction.update({ embeds: [], content: `**Proceeding..**`, components: [] });
        interaction.user.send({
            content: `> **Send Your ${choice.toUpperCase()} Account Name : **`,
            components: button
        }).then(sentMessage => {
            var filter = i => i.customId === 'cancelWithdraw' || i.customId === 'confirmWithdrawal';

            var collector = sentMessage.channel.createMessageComponentCollector({ filter, max: 1 });

            var replyFilter = message => message.author.id == interaction.user.id;
            var replyCollector = sentMessage.channel.createMessageCollector({ replyFilter, max: 1 })

            collector.on('collect', i => {
                if (i.customId == "cancelWithdraw") {
                    replyCollector.stop();
                    i.update({ content: `**❌ Withdrawal Process Cancelled.**`, components: [], embeds: [] });
                    collector.stop();
                }

                if (i.customId == "confirmWithdrawal") {
                    var timeInLondon = moment.tz(new Date(), 'Europe/London');
                    var timeInManila = timeInLondon.tz('Asia/Manila');
                    var DateAndTime = timeInManila.format('YYYY-MM-DD hh:mm:ss');

                    withdraw.id += 1
                    user_data.balance.withdrawable -= amount;


                    var info = {
                        choice: choice,
                        name: name,
                        number: number,
                        amount: amount
                    }

                    user_data.withdraw_info = info;

                    fs.writeFileSync(`./data/balances/${interaction.user.id}.json`, JSON.stringify(user_data, null, 3));
                    fs.writeFileSync('./data/withdraw.json', JSON.stringify(withdraw, null, 3));

                    i.update({
                        embeds: [{
                            color: "RANDOM",
                            title: `╔════════════════════╗\n      Withdrawal Receipt \n╚════════════════════╝`,
                            description: `**Date 🗓** : ${DateAndTime}\n**Transaction ID** : ${withdraw.id}\n**Account : **${choice.toUpperCase()}\n**Name : **${name}\n**Number : **${number}\n**Amount : **₱${amount}\n**Remaining : **₱${user_data.balance.withdrawable}\n\n> ✅ Withdrawal Request Sent\n> ⚠️ Withdrawal Request Will Be Processed Within 24 Hours.`
                        }],
                        components: []
                    });

                    var button3 = [
                        new Discord.MessageActionRow()
                            .addComponents(
                                new Discord.MessageButton()
                                    .setLabel('Paid')
                                    .setEmoji('✅')
                                    .setCustomId(`paid/${choice},${interaction.user.id},${withdraw.id}`)
                                    .setStyle('SUCCESS')
                            )
                            .addComponents(
                                new Discord.MessageButton()
                                    .setLabel('Cancel')
                                    .setEmoji('❌')
                                    .setCustomId(`cancelled/${choice},${interaction.user.id},${withdraw.id}`)
                                    .setStyle('DANGER')
                            )
                    ]

                    client.channels.cache.get(process.env.WITHDRAW_CHANNEL).send({
                        embeds: [{
                            color: "RANDOM",
                            title: `╔════════════════════╗\n      Withdrawal Receipt \n╚════════════════════╝`,
                            description: `**Date 🗓** : ${DateAndTime}\n**Transaction ID** : ${withdraw.id}\n**User : **<@${interaction.user.id}> : ${interaction.user.id}\n**Account : **${choice.toUpperCase()}\n**Name : **${name}\n**Number : **${number}\n**Amount : **₱${amount}\n**Remaining : **₱${user_data.balance.withdrawable}`
                        }],
                        components: button3
                    })
                }
            });

            replyCollector.on('collect', message => {
                name = message.content;
                sentMessage.edit({ content: `> ${choice.toUpperCase()} Account Name : ${name}`, components: [] });
                replyCollector.stop();
                message.author.send({
                    content: `> **Send Your ${choice.toUpperCase()} Number : **`,
                    components: button
                }).then((sentMessage) => {
                    replyCollector = sentMessage.channel.createMessageCollector({ replyFilter, max: 1 })
                    replyCollector.on('collect', message => {
                        number = message.content;
                        sentMessage.edit({ content: `> ${choice.toUpperCase()} Account Number : ${number}`, components: [] });
                        replyCollector.stop();
                        message.author.send({
                            embeds: [{
                                color: "RANDOM",
                                title: `How Much Do You Want To Withdraw ?`,
                                description: `*Withdrawable Balance : ₱*${user_data.balance.withdrawable}\n\n⁉️ Send The Amount You Want To Withdraw.\nExample : 200 (For ₱200)\n\n**⚠️ NOTE: MINIMUM WITHDRAWAL IS ₱100 ‼️\nWITHDRAWAL REQUEST WILL BE PROCESS WITHIN 24 HOURS**`
                            }],
                            components: button
                        }).then((sentMessage) => {
                            replyCollector = sentMessage.channel.createMessageCollector(replyFilter)
                            replyCollector.on('collect', message => {

                                if (message.author.bot) {
                                    return
                                }
                                amount = message.content;

                                if (isNaN(amount)) {
                                    return message.reply({
                                        content: `> **Please Send A Valid Amount**\n**⚠️ Minimum Withdraw Is ₱100.**`
                                    });
                                }

                                amount = parseFloat(amount);

                                var minimum = 100;

                                if (minimum > amount) {
                                    return message.reply({
                                        content: `> **Amount Did Not Reach The Minimum Of ₱100.**\n*Please Try Again.*`
                                    });
                                }

                                if (amount > user_data.balance.withdrawable) {
                                    return message.reply({
                                        content: `> **Amount Is Too Big For Your Balance.**\n*Please Try Again.*`
                                    })
                                }

                                var button2 = [
                                    new Discord.MessageActionRow()
                                        .addComponents(
                                            new Discord.MessageButton()
                                                .setCustomId('confirmWithdrawal')
                                                .setEmoji('✅')
                                                .setLabel('Confirm')
                                                .setStyle('SUCCESS')
                                        )
                                        .addComponents(
                                            new Discord.MessageButton()
                                                .setCustomId('cancelWithdraw')
                                                .setEmoji('❌')
                                                .setLabel('Cancel')
                                                .setStyle('DANGER')
                                        )
                                ]



                                sentMessage.edit({
                                    content: `> Withdrawal Amount : ₱${amount}`,
                                    components: [],
                                    embeds: []
                                })
                                replyCollector.stop();
                                message.author.send({
                                    embeds: [{
                                        color: "RANDOM",
                                        title: `╔════════════════════╗\n       Withdrawal Receipt \n╚════════════════════╝`,
                                        description: `> **Account :** *${choice.toUpperCase()}*\n> **Name :** *${name}*\n> **Number :** *${number}*\n> **Amount :** *₱${amount}*`
                                    }],
                                    components: button2
                                })
                            })
                        }).catch(err => {
                            console.log(err)
                        })
                    })
                })
            })

        })
    }

    if (data.customId.startsWith("paid")) {
        let [choice, user, id] = data.customId.split('/')[1].split(',');
        let user_data = require(`./data/balances/${user}.json`);
        let amount = user_data.withdraw_info.amount;
        let name = user_data.withdraw_info.name;
        let number = user_data.withdraw_info.number;

        user_data.total.withdraw += amount;
        totals.withdraw += amount;

        fs.writeFileSync(`./data/balances/${user}.json`, JSON.stringify(user_data, null, 3));
        fs.writeFileSync('./data/total.json', JSON.stringify(totals, null, 3));


        client.users.fetch(user).then(author => {
            author.send({
                embeds : [{
                    color: "GREEN",
                    title: `Withdrawal Request Paid.`,
                    description : `*Dear <@${user}> Transaction #${id} Was Marked As* **PAID**.\n*₱${amount} Was Transferred To Your ${choice.toUpperCase()} Account.*`
                }]
            })
        });

        var timeInLondon = moment.tz(new Date(), 'Europe/London');
        var timeInManila = timeInLondon.tz('Asia/Manila');
        var DateAndTime = timeInManila.format('YYYY-MM-DD hh:mm:ss');

        interaction.update({
            embeds: [{
                color: "GREEN",
                title: `╔════════════════════╗\n      ✅ Marked As Paid \n╚════════════════════╝`,
                description: `**Date 🗓** : ${DateAndTime}\n**Transaction ID** : ${id}\n**User : **<@${user}> : ${user}\n**Account : **${choice.toUpperCase()}\n**Name : **${name}\n**Number : **${number}\n**Amount : **₱${amount}\n**Remaining : **₱${user_data.balance.withdrawable}`
            }],
            components: []
        })
    }

    if (data.customId.startsWith("cancelled")) {
        let [choice, user, id] = data.customId.split('/')[1].split(',');
        let user_data = require(`./data/balances/${user}.json`);
        let amount = user_data.withdraw_info.amount;
        let name = user_data.withdraw_info.name;
        let number = user_data.withdraw_info.number;

        user_data.balance.withdrawable += amount;
        fs.writeFileSync(`./data/balances/${user}.json` , JSON.stringify(user_data , null , 3));

        client.users.fetch(user).then(author => {
            author.send({
                embeds : [{
                    color: "RED",
                    title: `Withdrawal Request Cancelled.`,
                    description : `*Dear <@${user}> Transaction #${id} Was* **CANCELLED** *Upon Your Request* .\n*₱${amount} Was Returned To Your FIAT Account.*`
                }]
            });
        });

        var timeInLondon = moment.tz(new Date(), 'Europe/London');
        var timeInManila = timeInLondon.tz('Asia/Manila');
        var DateAndTime = timeInManila.format('YYYY-MM-DD hh:mm:ss');

        interaction.update({
            embeds: [{
                color: "GREEN",
                title: `╔════════════════════╗\n      ❌ Marked As Cancelled \n╚════════════════════╝`,
                description: `**Date 🗓** : ${DateAndTime}\n**Transaction ID** : ${id}\n**User : **<@${user}> : ${user}\n**Account : **${choice.toUpperCase()}\n**Name : **${name}\n**Number : **${number}\n**Amount : **₱${amount}\n**Remaining : **₱${user_data.balance.withdrawable}\n\n**Cancelled By : **<@${interaction.user.id}>`
            }],
            components: []
        })
    }

    if (data.customId === 'play') {
        interaction.reply({
            content: `> **Please Visit <#${process.env.CHANNEL_ID}> To Start Playing**`
        })
    }

    if (data.customId === 'guide') {
        interaction.reply({
            content : `> **To Check The Guide Please Visit** <#${process.env.INSTRUCTION_CHANNEL_ID}> **.**\n\n*If You Have More Questions Please Contact* <@${process.env.DEV_ID}>`
        })
    }
});

client.login(process.env.BOT_TOKEN);