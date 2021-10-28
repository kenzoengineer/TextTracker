const Discord = require('discord.js');
const Moment = require('moment');
const { MongoClient } = require('mongodb');

const trackerDb = "TextTracker";
const wordsCollection = "TrackedWords";
const client = new Discord.Client();
const uri = `mongodb+srv://replit-user-01:${process.env['password']}@mybotcluster.mbqon.mongodb.net/TextTracker?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.on('ready', async () => {
    client.user.setActivity('!help');
    await mongoClient.connect();
    await console.log('ready!');
});

const getErrorEmbed = (desc) => {
    return new Discord.MessageEmbed()
        .setColor('#E85959')
        .setTitle('Error!')
        .setDescription(desc);
}

const dbInsert = async (_guild, _word, _user) => {
    let findResults = await dbGet(_guild, _word, _user);
    if (findResults.length > 0) {
        return false;
    }
    const col = mongoClient.db(trackerDb).collection(wordsCollection);
    await col.insertOne({guild_id: _guild,word: _word,user_id: _user});
    return true;
}

const dbGet = async (_guild, _word, _user) => {
    const col = mongoClient.db(trackerDb).collection(wordsCollection);
    let res = await col.find({guild_id: _guild, word: _word, user_id: _user}).toArray();
    return res;
}

const dbGetAll = async (_guild) => {
    const col = mongoClient.db(trackerDb).collection(wordsCollection);
    let res = await col.find({guild_id: _guild}).toArray();
    return res;
}

const dbDelete = async (_guild, _word, _user) => {
    const col = mongoClient.db(trackerDb).collection(wordsCollection);
    await col.deleteOne({guild_id: _guild, word: _word, user_id: _user});
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
                let result = await dbInsert(msg.guild.id,word,user);
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
            let res = await dbGetAll(msg.guild.id);
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
                await dbDelete(msg.guild.id, word, user);
                await msg.channel.send("Success.");
            } catch (e) {
                console.log(e);
            }
        }
        
        if (cmd === "close") {
            mongoClient.close();
        }
    }
});

process.on('exit', () => {
    mongoClient.close();
    console.log('exiting...');
});

client.login(process.env['token']);