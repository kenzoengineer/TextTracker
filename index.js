const Discord = require('discord.js');
const Moment = require('moment');
const client = new Discord.Client();

const TrackedWords = require('./TrackedWords');

client.on('ready', async () => {
    client.user.setActivity('!help');
    await TrackedWords.connect();
    await console.log('ready!');
});

const getErrorEmbed = (desc) => {
    return new Discord.MessageEmbed()
        .setColor('#E85959')
        .setTitle('Error!')
        .setDescription(desc);
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
    }

    //text tracking
    let res = await TrackedWords.dbGet(msg.guild.id, null, msg.author.id);
    res.forEach((tracker) => {
        if (msg.content.includes(tracker.word)) {
            //insert into db
        }
    });
});

process.on('exit', () => {
    console.log('exiting...');
});

client.login(process.env['token']);