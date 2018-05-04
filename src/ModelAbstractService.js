const Promise = require('bluebird');
const uuidV4 = require('uuid/v4');

class ModelAbstractService {

    constructor(collection, storage) {
        this.COLLECTION = collection;
        this.storage = storage;
        this.primaryKey = 'id';
    }

    all() {
        return new Promise((resolv, reject) => {
            this.storage.getCollection(this.COLLECTION)
                .then(col => {
                    col.find({}).toArray()
                        .then(items => {
                            resolv(items.map(this.modelMap))
                        })
                        .catch(reject)
                })
                .catch(reject)
        })
    }

    get(value) {
        return new Promise((resolv, reject) => {
            let query = {};
            query[this.primaryKey] = value;
            this.find(query)
                .then(data => {
                    if (0 >= data.length) {
                        reject({
                            status: 404,
                            message: 'Not Found'
                        })
                    }
                    resolv(data[0])

                })
                .catch(reject)
        });
    }

    find(query) {

        return new Promise((resolv, reject) => {
            this.storage.getCollection(this.COLLECTION)
                .then(col => {
                    col.find(query)
                        .toArray()
                        .then(items => {
                            resolv(items.map(this.modelMap));
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    }

    create(data) {

        if (typeof data[this.primaryKey] == 'undefined') {
            return this._create(data)
        }
        return new Promise((resolv, reject) => {

            this.get(data[this.primaryKey]).then((object) => {
                let err = new Error(this.primaryKey + ' already exists.');
                err.statusCode = 400;
                reject(err);
            }).catch(() => {
                this._create(data).then(resolv).catch(reject);
            });
        });

    }

    _create(data) {

        return new Promise((resolv, reject) => {
            this.bulkCreate([data])
                .then(data => {
                    resolv(data[0])
                })
                .catch(reject);
        });
    }

    update(id, data) {
        return new Promise((resolv, reject) => {
            this.get(id)
                .then(collection => {
                    let object = this.modelMap(data, collection);
                    this.storage.getCollection(this.COLLECTION).then(col => {
                        col.updateOne({id: id}, object)
                            .then(() => {
                                resolv(this.modelMap(object));
                            })
                            .catch(reject);
                    });
                })
                .catch(reject);
        });
    }

    delete(value) {
        return new Promise((resolv, reject) => {
            this.get(value)
                .then(collection => {
                    this.storage.getCollection(this.COLLECTION).then(col => {
                        let query = {};
                        query[this.primaryKey] = value;
                        col.deleteOne(query)
                            .then((resp) => {
                                if (true != resp.result.ok) return reject({
                                    status: 500,
                                    message: 'Not Work'
                                });
                                resolv();
                            })
                            .catch(reject);
                    });
                })
                .catch(reject);
        });
    }

    bulkCreate(data) {
        let collections = data.map(this.modelMap);

        return new Promise((resolv, reject) => {
            this.storage.getCollection(this.COLLECTION)
                .then(col => {
                    col.insertMany(collections)
                        .then(elements => {
                            resolv(elements.ops.map(element => {
                                return this.modelMap(element);
                            }));
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    }

    modelMap(data, model) {
        return {
            id: data.id || model.id || uuidV4(),
            name: data.name || model.name,
        }
    }
}

module.exports = ModelAbstractService;