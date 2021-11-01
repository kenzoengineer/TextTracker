const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://replit-user-01:${process.env['password']}@mybotcluster.mbqon.mongodb.net/TextTracker?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const trackerDb = "TextTracker";
const colWords = mongoClient.db(trackerDb).collection("TrackedWords");

const self = module.exports = {
    connect: async () => {
        await mongoClient.connect();
    },
    dbGet: async (_guild, _word, _user) => {
        let criteria = {};
        if (_guild) criteria.guild_id = _guild;
        if (_word) criteria.word = _word;
        if (_user) criteria.user_id = _user;
        let res = await colWords.find(criteria).toArray();
        return res;
    },
    dbInsert: async (_guild, _word, _user) => {
        let findResults = await self.dbGet(_guild, _word, _user);
        if (findResults.length > 0) {
            return false;
        }
        await colWords.insertOne({guild_id: _guild,word: _word,user_id: _user});
        return true;
    },
    dbDelete: async (_guild, _word, _user) => {
        let res = await colWords.deleteOne({guild_id: _guild, word: _word, user_id: _user});
        console.log(res);
        return res.acknowledged && res.deletedCount > 0;
    }
}