const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://replit-user-01:${process.env['password']}@mybotcluster.mbqon.mongodb.net/TextTracker?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const trackerDb = "TextTracker";
const col = mongoClient.db(trackerDb).collection("TrackedWords");

const self = module.exports = {
    connect: async () => {
        await mongoClient.connect();
    },
    dbGet: async (_guild, _word, _user) => {
        let criteria = {};
        if (_guild) criteria.guild_id = _guild;
        if (_word) criteria.word = _word;
        if (_user) criteria.user_id = _user;
        let res = await col.find(criteria).toArray();
        return res;
    },
    dbInsert: async (_guild, _word, _user) => {
        let findResults = await self.dbGet(_guild, _word, _user);
        if (findResults.length > 0) {
            return false;
        }
        await col.insertOne({guild_id: _guild,word: _word,user_id: _user});
        return true;
    },
    dbDelete: async (_guild, _word, _user) => {
        let res = await col.deleteOne({guild_id: _guild, word: _word, user_id: _user});
        console.log(res);
        return res.acknowledged && res.deletedCount > 0;
    }
}