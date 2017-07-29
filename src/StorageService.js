let config = require('dotenv').config().parsed;
let MongoClient = require('mongodb').MongoClient;
let Promise = require('bluebird');
let uri = config.MONGO_URI;

class StorageService {
    /**
     * @method constructor
     * @param client
     */
    constructor(client) {
        this.db = null;
        this.client = client;
    }


    /**
     * Get the db
     * @method
     * @return {Promise} returns Promise
     */
    getDB() {
        return new Promise((resolv, reject) => {
            if (this.db === null) {
                this.client
                    .connect(uri)
                    .then(db => {
                        this.db = db;
                        resolv(db)
                    })
                    .catch(reject);
                return
            }
            resolv(this.db)
        })
    }

    /**
     * Fetch a specific collection (containing the actual collection information). `let collection = db.collection('mycollection');`
     *
     * @method getCollection
     * @param {string} name the collection name we wish to access.
     * @param {object} [options=null] Optional settings.
     * @param {(number|string)} [options.w=null] The write concern.
     * @param {number} [options.wtimeout=null] The write concern timeout.
     * @param {boolean} [options.j=false] Specify a journal write concern.
     * @param {boolean} [options.raw=false] Return document results as raw BSON buffers.
     * @param {object} [options.pkFactory=null] A primary key factory object for generation of custom _id keys.
     * @param {(ReadPreference|string)} [options.readPreference=null] The preferred read preference (ReadPreference.PRIMARY, ReadPreference.PRIMARY_PREFERRED, ReadPreference.SECONDARY, ReadPreference.SECONDARY_PREFERRED, ReadPreference.NEAREST).
     * @param {boolean} [options.serializeFunctions=false] Serialize functions on any object.
     * @param {boolean} [options.strict=false] Returns an error if the collection does not exist
     * @param {object} [options.readConcern=null] Specify a read concern for the collection. (only MongoDB 3.2 or higher supported)
     * @param {object} [options.readConcern.level='local'] Specify a read concern level for the collection operations, one of [local|majority]. (only MongoDB 3.2 or higher supported)
     * @return {Collection} return the new Collection instance if not in strict mode
     */
    getCollection(name, options) {
        return new Promise((resolv, reject) => {
            this.getDB().then(db => {
                resolv(db.collection(name, options))
            }).catch(reject);
        });
    }

    /**
     * Close the db and its underlying connections
     * @method close
     * @param {boolean} force Force close, emitting no events
     * @return {Promise} returns Promise
     */
    close(force) {
        force = (typeof force == 'undefined') ? force = false : force;
        return new Promise((resolv, reject) => {
            if (this.db !== null) {
                return this.db.close(force).then(resolv).catch(reject);
            }
            resolv(null);
        });
    }
}

module.exports = new StorageService(MongoClient);