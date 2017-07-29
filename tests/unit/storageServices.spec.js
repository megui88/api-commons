const client = require('mongodb');

const expect = require('chai').expect;

const storage = require('../../src/StorageService');

const Promise = require('bluebird');

describe('The storage service happy pass', () => {

    it('try connect', function (done) {

        this.sandbox.stub(client.MongoClient, 'connect').callsFake(() => {

            return new Promise((resolv) => {
                resolv({
                    collection: () => {
                        return new Promise((resolv) => {
                            resolv([]);
                        });
                    },
                    close: () => {
                        return new Promise((resolv) => {
                            resolv(null);
                        });
                    }
                });
            });
        });
        storage.db = null;
        const promise = storage.getDB();

        promise.then(function (db) {
            db.close(true).then((data) => {

                expect(data).to.be.a('null');
                done();
            });
        });
    });

    it('try get collection', function (done) {

        const promise = storage.getCollection('some');

        promise.then(function (collection) {
            expect(collection.length).to.be.equal([].length);
            done();
        });
    });

    it('try close connection', function (done) {

        const promise = storage.close(true);

        promise.then(function (data) {
            expect(data).to.be.a('null');
            done();
        });
    });

    it('try close witch not are connection', function (done) {
        storage.db = null;
        const promise = storage.close(); //force = undefined

        promise.then(function (data) {
            expect(data).to.be.a('null');
            done();
        });
    });

});

describe('The storage service when fail', () => {

    it('try connect', function (done) {

        this.sandbox.stub(client.MongoClient, 'connect').callsFake(() => {

            return new Promise((resolv, reject) => {
                reject({
                    code: 500,
                    message: 'Some problem!'
                });
            });
        });

        storage.db = null;
        const promise = storage.getDB();

        promise
            .then(() => {
                done();
                throw new Error('Check this!');
            })
            .catch(err => {
                expect(err.message).to.be.equal('Some problem!');
                done();
            });
    });

    it('try get collection when connection fail', function (done) {


        this.sandbox.stub(client.MongoClient, 'connect').callsFake(() => {

            return new Promise((resolv, reject) => {
                reject({
                    code: 500,
                    message: 'Some problem!'
                });
            });
        });

        storage.db = null;
        const promise = storage.getCollection('some');

        promise
            .then(() => {
                done();
                throw new Error('Check this!');
            })
            .catch(err => {
                expect(err.message).to.be.equal('Some problem!');
                done();
            });
    });

    it('try get collection when collection fail', function (done) {


        this.sandbox.stub(client.MongoClient, 'connect').callsFake(() => {

            return new Promise((resolv) => {
                resolv({
                    collection: () => {
                        return new Promise((resolv, reject) => {
                            reject({
                                code: 500,
                                message: 'Some problem!'
                            });
                        });
                    }
                });
            });
        });

        storage.db = null;
        const promise = storage.getCollection('some');

        promise
            .then(() => {
                done();
                throw new Error('Check this!');
            })
            .catch(err => {
                expect(err.message).to.be.equal('Some problem!');
                done();
            });
    });

});