const Discord = require('discord.js');
const Moment = require('moment');
const QuickChart = require('quickchart-js');
const keep_alive = require('./alive.js');
const client = new Discord.Client();

const TrackedWords = require('./TrackedWords');
const WordCounts = require('./WordCounts');
const Embeds = require('./Embeds');

client.on('ready', async () => {
    client.user.setActivity('!help');
    await TrackedWords.connect();
    await WordCounts.connect();
    await console.log('ready!');
});

client.on('message', async (msg) => {
    if (msg.content.startsWith('!')) { //prefix
        let fullCmd = msg.content.split(' ');
        let cmd = fullCmd[0].substring(1);

        if (cmd === "add") {
            if (fullCmd.length < 3) {
                await msg.channel.send({
                    embed: Embeds.getErrorEmbed('Not enough arguments. Please use: `!add <user> <word>`')
                });
                return;
            }
            let user = fullCmd[1].replace("<@!","").replace(">","");
            let word = fullCmd[2];
            try {
                let result = await TrackedWords.dbInsert(msg.guild.id,word,user);
                if (result) {
                    await msg.channel.send({
                        embed: Embeds.getSuccessEmbed(`Successfully addded ${word}.`)
                    });
                } else {
                    await msg.channel.send({
                        embed: Embends.getErrorEmbed(`${word} is already being tracked.`)
                    });
                }
                
            } catch (e) {
                console.log(e);
            }
        }

        if (cmd === "list") {
            let res = await TrackedWords.dbGet(msg.guild.id);
            let words = res.map(x => x.word).join("\n");
            let users = res.map(x => client.users.cache.find(y => y.id = x.user_id)).join("\n");
            const embed = new Discord.MessageEmbed()
                .setColor('#ED6B6B')
                .setTitle('Current Trackers')
                .addFields(
                    {name:'Word:', value: words, inline:true},
                    {name:'User:', value: users, inline:true}
                );
            msg.channel.send({embed});
        }
        
        if (cmd === "remove") {
            if (fullCmd.length < 3) {
                await msg.channel.send({
                    embed: Embeds.getErrorEmbed('Not enough arguments. Please use: `!remove <user> <word>`')
                });
                return;
            }
            let user = fullCmd[1].replace("<@!","").replace(">","");
            let word = fullCmd[2];
            try {
                let res = await TrackedWords.dbDelete(msg.guild.id, word, user);
                await msg.channel.send(res ? {
                    embed: Embeds.getSuccessEmbed(`Removed ${word}`)
                } : {
                    embed: Embeds.getErrorEmbed('Tracker does not exist.')
                });
            } catch (e) {
                console.log(e);
            }
        }

        if (cmd === "count") {
            let user = fullCmd[1].replace("<@!","").replace(">","");
            let word = fullCmd[2];
            let tracker = await TrackedWords.dbGet(msg.guild.id, word, user);

            if (!tracker[0]) {
                await msg.channel.send({
                    embed: Embeds.getErrorEmbed('Could not find the requested tracker. Make sure you are using the format `!count <user> <word>`')
                });
            } else {
                let res = await WordCounts.dbCount(tracker[0]._id);
                await msg.channel.send({
                    embed: Embeds.getResultEmbed(`${msg.guild.member(user).nickname} has said ${word} ${res} times.`)
                });
            }
        }

        if (cmd === "chart") {
            let user = fullCmd[1].replace("<@!","").replace(">","");
            let word = fullCmd[2];
            let tracker = await TrackedWords.dbGet(msg.guild.id, word, user);

            if (!tracker[0]) {
                await msg.channel.send({
                    embed: Embeds.getErrorEmbed('Could not find the requested tracker. Make sure you are using the format `!chart <user> <word>`')
                });
            } else {
                const myChart = new QuickChart();
                let _dates = [];
                let _data = [];
                for (let i = 0; i < 5; i++) {
                    let d = Moment().subtract(i,'days');
                    _dates.unshift(d.format("MMM DD"));
                    let res = await WordCounts.dbCount(tracker[0]._id, d);
                    _data.unshift(res);
                }
                console.log(_dates);
                console.log(_data);
                myChart.setConfig({
                    type: 'line',
                    data: {labels: _dates, datasets: [{label: `${word}`,data: _data, lineTension: 0.4}]},
                    options: {
                        scales: {
                            y: {
                                min: 0
                            }
                        }
                    }
                });
                await msg.channel.send(myChart.getUrl());
            }
        }

        if (cmd === "help") {
            await msg.channel.send({
                embed: Embeds.getHelpEmbed(
                "`!add <user> <word>`\n"+
                "Adds a word to be tracked\n\n"+
                "`!list`\n"+
                "Lists all tracked words\n\n"+
                "`!remove <user> <word>`\n"+
                "Removes a currently tracked word\n\n"+
                "`!count <user> <word>`\n"+
                "Gets the amount of times the word has been said\n\n"+
                "`!chart <user> <word>`\n"+
                "Plots the occurances of words over a period of 5 days"
                )
            });
        }
    } else {
        //text tracking (not a command)
        let res = await TrackedWords.dbGet(msg.guild.id, null, msg.author.id);
        res.forEach((tracker) => {
            if (msg.content.includes(tracker.word)) {
                //insert into db
                console.log(new Date());
                let success = WordCounts.dbUpsert(tracker._id, new Date());
                //console.log(success);
            }
        });
    }
});

process.on('exit', () => {
    console.log('exiting...');
});

client.login(process.env['token']);