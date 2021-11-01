const Discord = require('discord.js');
const Moment = require('moment');
const QuickChart = require('quickchart-js');
const client = new Discord.Client();

const TrackedWords = require('./TrackedWords');
const WordCounts = require('./WordCounts');

client.on('ready', async () => {
    client.user.setActivity('!help');
    await TrackedWords.connect();
    await WordCounts.connect();
    await console.log('ready!');
});

const getErrorEmbed = (desc) => {
    return new Discord.MessageEmbed()
        .setColor('#E85959')
        .setTitle('Error!')
        .setDescription(desc);
}

const getResultEmbed = (desc) => {
    return new Discord.MessageEmbed()
    .setColor('#F6FD85')
    .setTitle(desc)
}

client.on('message', async (msg) => {
    if (msg.content.startsWith('!')) { //prefix
        let fullCmd = msg.content.split(' ');
        let cmd = fullCmd[0].substring(1);

        if (cmd === "add") {
            if (fullCmd.length < 3) {
                await msg.channel.send({
                    embed: getErrorEmbed('Not enough arguments. Please use: `!add <user> <word>`')
                });
                return;
            }
            let user = fullCmd[1].replace("<@!","").replace(">","");
            let word = fullCmd[2];
            try {
                let result = await TrackedWords.dbInsert(msg.guild.id,word,user);
                if (result) {
                    await msg.channel.send("Success.");
                } else {
                    await msg.channel.send("Entry already exists.");
                }
                
            } catch (e) {
                console.log(e);
            }
        }

        if (cmd === "get") {
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
                    embed: getErrorEmbed('Not enough arguments. Please use: `!remove <user> <word>`')
                });
                return;
            }
            let user = fullCmd[1].replace("<@!","").replace(">","");
            let word = fullCmd[2];
            try {
                let res = await TrackedWords.dbDelete(msg.guild.id, word, user);
                await msg.channel.send(res ? "Success." : "Failed.");
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
                    embed: getErrorEmbed('Could not find the requested tracker. Make sure you are using the format `!count <user> <word>`')
                });
            } else {
                let res = await WordCounts.dbCount(tracker[0]._id);
                await msg.channel.send({
                    embed: getResultEmbed(`${word} count for ${fullCmd[1]} is ${res}.`)
                });
            }
        }

        if (cmd === "chart") {
            let user = fullCmd[1].replace("<@!","").replace(">","");
            let word = fullCmd[2];
            let tracker = await TrackedWords.dbGet(msg.guild.id, word, user);

            if (!tracker[0]) {
                await msg.channel.send({
                    embed: getErrorEmbed('Could not find the requested tracker. Make sure you are using the format `!chart <user> <word>`')
                });
            } else {
                const myChart = new QuickChart();
                let _dates = [];
                let _data = [];
                for (let i = 0; i < 5; i++) {
                    let d = Moment().subtract(i,'days');
                    _dates.unshift(d.format("YYYY-MM-DD"));
                    let res = await WordCounts.dbCount(tracker[0]._id, d);
                    _data.unshift(res);
                }
                console.log(_dates);
                console.log(_data);
                myChart.setConfig({
                    type: 'line',
                    data: {labels: _dates, datasets: [{label: 'Count',data: _data}]}
                });
                await msg.channel.send(myChart.getUrl());
            }
        }

    } else {
        //text tracking (not a command)
        let res = await TrackedWords.dbGet(msg.guild.id, null, msg.author.id);
        res.forEach((tracker) => {
            if (msg.content.includes(tracker.word)) {
                //insert into db
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