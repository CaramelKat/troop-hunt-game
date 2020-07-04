const mongoose = require('mongoose');
const { TROOP } = require('./models/troop');
const { QUESTION } = require('./models/question');
const { mongoose: mongooseConfig } = require('./config.json');
const { uri, database, options } = mongooseConfig;

let connection;
async function connect() {
    await mongoose.connect(`${uri}/${database}`, options);
    connection = mongoose.connection;
    connection.on('error', console.error.bind(console, 'connection error:'));
}

function verifyConnected() {
    if (!connection) {
        throw new Error('Cannot make database requets without being connected');
    }
}

async function getTroopByNumber(troop_number) {
    verifyConnected();
    return await TROOP.findOne({
        troop_number
    });
}

async function getTroopByGuideName(troop_guide) {
    verifyConnected();
    return await TROOP.findOne({
        troop_guide
    });
}

async function getTroopsBySession(session) {
    verifyConnected();
    return await TROOP.find({
        session
    });
}

async function getAllTroops() {
    verifyConnected();
    return await TROOP.find();
}

async function getQuestionByID(question_id) {
    verifyConnected();
    return await QUESTION.findOne({
        question_id
    });
}

async function getAllQuestions() {
    verifyConnected();
    return await QUESTION.findOne();
}

module.exports = {
    connect,
    getTroopByNumber,
    getTroopByGuideName,
    getTroopsBySession,
    getAllTroops,
    getQuestionByID,
    getAllQuestions
};