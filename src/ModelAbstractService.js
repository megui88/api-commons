const Promise = require('bluebird');
const uuidV4 = require('uuid/v4');

class ModelAbtractService {

    constructor(collection, storage) {
        this.COLLECTION = collection;
        this.storage = storage;
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

    get(id) {
        return new Promise((resolv, reject) => {
            this.find({id: id})
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

module.exports = ModelAbtractService;