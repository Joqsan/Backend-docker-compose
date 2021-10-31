import express from 'express';
import { MongoClient, Db } from 'mongodb';
import debugFactory from 'debug';
import morgan from 'morgan';

const debug = debugFactory('server');


const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;
const DB_PORT = process.env.DB_PORT;
const SERVER_PORT = +process.env.SERVER_PORT!;


const getDataFromDB = (() => {

    let cache: Record<string, Array<any>> | null = null;
    return async function(db: Db) {
        if (cache) {
            debug('Get data from cache');

            return cache;
        }
        const commandCursor = db.listCollections();
        const data: Record<string, Array<any>> = {};
        while (await commandCursor.hasNext()) {
            const collectionInfo = (await commandCursor.next()) as { name: string };

            if (!collectionInfo) continue;

            const collection = db.collection(collectionInfo.name);

            debug('Processing collection: %s', collectionInfo.name);

            const docs = await collection.find({}).toArray();

            data[collectionInfo.name] = docs;
        }
        cache = data;
        return data;
    }
})();

async function connectMongoClient() {

    debug('Connecting to ' + DB_NAME + ' at port ' + DB_PORT);

    const host = [[DB_HOST, DB_PORT].join(':'), DB_NAME].join('/');
    const url = ['mongodb', host].join('://');

    const mongoClient = await MongoClient.connect(url, { useUnifiedTopology: true });
    const db = mongoClient.db(DB_NAME);

    debug('Database %s connected successfully', DB_NAME);

    return db;
}

async function main() {
    const app = express();

    app.use(morgan('dev'));

    const db = await connectMongoClient();

    app.listen(SERVER_PORT, () => {
        debug('Server ready and listening on %d', SERVER_PORT);
    });

    app.get('/', async (_, res) => {
        const data = await getDataFromDB(db);
        res.json(data).end();
    });

    app.get('/health', async (_, res) => {
        res.status(200).end();
    });

    app.use((_, res) => {
        res.status(404).send('Invalid request');
    });

}

main().catch(error => { throw error });
