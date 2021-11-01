const { MongoClient } = require('mongodb');
const Moment = require('moment');
const uri = `mongodb+srv://replit-user-01:${process.env['password']}@mybotcluster.mbqon.mongodb.net/TextTracker?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const trackerDb = "TextTracker";
const col = mongoClient.db(trackerDb).collection("WordCounts");

const self = module.exports = {
    connect: async () => {
        await mongoClient.connect();
    },
    dbGet: async (_id, _date) => {
        let criteria = {};
        if (_id) criteria.tracker_id = _id;
        if (_date) criteria.date = _date;
        let res = await col.find(criteria).toArray();
        return res;
    },
    dbUpsert: async (_id, _date) => {
        //update OR insert actually
        let formatted_date = Moment(_date).format('YYYY-MM-DD');
        let count = await col.countDocuments({tracker_id : _id, date: formatted_date});
        if (count > 0) {
            let res = await col.updateOne({tracker_id: _id}, {$inc: {count: 1}});
            return res;
        }
        let res = await col.insertOne({tracker_id: _id, count: 1, date: formatted_date});
        return res;
    },
    dbCount: async (_id, _date) => {
        let criteria = {tracker_id: _id};
        if (_date) criteria.date = Moment(_date).format('YYYY-MM-DD');
        let res = await col.find(criteria).toArray();
        return res.map(a => a.count).reduce((x,y) => x + y );
    }
}