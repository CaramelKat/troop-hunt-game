'use strict';
const express = require('express');
const multer = require('multer');
const upload = multer();
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');

const { TROOP } = require('./models/troop');
const { QUESTION } = require('./models/question');
const database = require('./database');
const tools = require('./tools');
const config = require('./config.json');

const { http: { port } } = config;
const app = express();
app.use(bodyParser.json());
require('events').EventEmitter.defaultMaxListeners = 50;
app.use(upload.array());
app.use(express.static('public'));

app.post('game/newTroop', function(req, res){
    let troop = {
        troop_number: req.body.troop_number,
        troop_guide: req.body.troop_guide,
        session: req.body.session,
        points: 0,
    };
    const newPost = new TROOP(troop);
    newPost.save();
    res.send(newPost);
});

app.post('/game/newQuestion', function(req, res) {
    let questions = req.body.Questions;
    for (let i = 0; i < questions.length; i++) {
        let question = {
        question_id: req.body.Questions[i].Id,
        question_text: req.body.Questions[i].QuestionText,
        question_value: parseInt(req.body.Questions[i].Points),
        };
        const newQuestion = new QUESTION(question);
        newQuestion.save(function(err, doc) {
            if (err) return console.error(err);
        });
    }
    res.sendStatus(200);
});

app.post('/game/redeemQuestion', function(req, res){
    database.connect().then(async e => {
        let question = await database.getQuestionByID(req.body.question_id);
        let troop = await database.getTroopByNumber(req.body.troop_number);
        if (question === null || troop === null)
            res.send('<link rel="stylesheet" href="css/layout.css">\n<center><div>An Error occurred, Please try again later</div></center>');
        else
        {
            if(await troop.hasQuestion(question.question_id))
                res.send('<link rel="stylesheet" href="css/layout.css">\n<center><div>You have already redeemed that question!</div></center>');
            else
            {
                await troop.addPoints(parseInt(question.question_value));
                await troop.addQuestion(question.question_id);
                res.send('<link rel="stylesheet" href="css/layout.css">\n<center><div>Question Received! Your troop now has ' + troop.points + ' points!</div></center>');
            }
        }
    });
});

app.get('/game/redeemQuestion', function(req, res) {
    let question_id = req.query.question_id;
    database.connect().then(async e => {
        let question = await database.getQuestionByID(question_id);
        if (question === null)
            res.sendFile(__dirname + '/404.html');
        else
        {
            let troops = await database.getTroopsBySession('3');
            let troop_number_tag = '';
            for(let i =0; i < troops.length; i++)
            {
                troop_number_tag += '<option value="' + troops[i].troop_number + '">' + troops[i].troop_number + '</option>\n'
            }
            let file = await fs.readFile(__dirname + '/addQuestion.html', 'utf-8');
            let newFile = file.replace(/QUESTION_ID_TAG/g, question.question_id)
                .replace(/QUESTION_TEXT/g, question.question_text)
                .replace(/TROOP_NUMBER_TAG/g, troop_number_tag)
            res.send(newFile);
        }
    });
});

app.get('/getTroops', function(req, res) {
    const period = req.query.p;
    tools.data.buildTable(period, res);
});
app.get('/game', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.get('/game/css/*', function(req, res) {
    let filename = req.originalUrl.replace('/css/', '').trim();
    res.sendFile(__dirname + '/css/' + filename);
})

app.listen(port, function (err) {
    if (err) {
        throw err
    }
    app.use(cors());

    console.log('Server started on port ' + port)
});