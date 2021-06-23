'use strict';
const express = require('express');
const multer = require('multer');
const morgan = require('morgan');
const ejs = require('ejs');
const upload = multer();
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');

const { TROOP } = require('./models/troop');
const { QUESTION } = require('./models/question');
const { SETTINGS } = require('./models/settings');
const database = require('./database');
const tools = require('./tools');
const config = require('./config.json');

const { http: { port } } = config;
const app = express();
app.use(bodyParser.json());
require('events').EventEmitter.defaultMaxListeners = 50;
app.use(upload.array());
app.use(express.static('public'));
app.use(morgan('combined'))

app.set('etag', false);
app.disable('x-powered-by');
app.set('view engine', 'ejs');
app.set('views', __dirname + '/webfiles');

app.post('/game/redeemQuestion', function(req, res){
    database.connect().then(async e => {
        let question = await database.getQuestionByID(req.body.question_id);
        let troop = await database.getTroopByNumber(req.body.troop_number);
        if (question === null || troop === null)
            res.send('<link rel="stylesheet" href="webfiles/css/layout.css">\n<center><div>An Error occurred, Please try again later</div></center>');
        else
        {
            if(await troop.hasQuestion(question._id) && !question.reusable)
                res.send('<link rel="stylesheet" href="webfiles/css/layout.css">\n<center><div>You have already redeemed that question!</div></center>');
            else
            {
                await troop.addPoints(parseInt(question.question_value));
                await troop.addQuestion(question._id);
                res.send('<link rel="stylesheet" href="webfiles/css/layout.css">\n<center><div>Question Received! Your troop now has ' + troop.points + ' points!</div></center>');
            }
        }
    });
});
app.get('/game/redeemQuestion/:questionID', function(req, res) {
    database.connect().then(async e => {
        let question = await database.getQuestionByID(req.params.questionID);
        if (question === null)
            res.sendFile(__dirname + '/webfiles/404.html');
        else
        {
            let settings = await database.getSettings()
            let troops = await database.getTroopsBySession(settings.period);
            res.render('addQuestion.ejs', {
                troops: troops,
                question: question
            });
        }
    });
});
app.get('/getTroops', function(req, res) {
    const period = req.query.p;
    tools.data.buildTable(period, res);
});
app.get('/game', function(req, res) {
    database.connect().then(async e => {
        let settings = await database.getSettings();
        if(settings === null) {
            settings = new SETTINGS({period: 1});
            settings.save();
        }
        let leaderboard = await database.getTroopsBySession(settings.period)
        res.render('index.ejs', {
            leaderboard: leaderboard,
            settings: settings
        });

    }).catch(error => {
        console.log(error);
        res.sendStatus(400);
    });
});
app.get('/game/css/:filename', function(req, res) {
    res.sendFile(__dirname + '/webfiles/css/' + req.params.filename);
});
app.get('/game/js/:filename', function(req, res) {
    res.sendFile(__dirname + '/webfiles/js/' + req.params.filename);
});

app.get('/admin', function(req, res){
    database.connect().then(async e => {
        let settings = await database.getSettings();
        if(settings === null) {
            settings = new SETTINGS({period: 1});
            settings.save();
        }
        res.render('admin_home.ejs', {
            settings: settings,
        });

    }).catch(error => {
        console.log(error);
        res.sendStatus(400);
    });
});
app.post('/admin/update', function(req, res){
    database.connect().then(async e => {
        let settings = await database.getSettings();
        if(req.body.period && settings.period !== req.body.period)
            settings.period = req.body.period;
        settings.save();
        res.send('<h2>Period has been Updated</h2>');
    }).catch(error =>
    {
        res.statusCode = 400;
        res.send('<h2>Period could not be updated.</h2><br><h4>' + error.message + '</h4>');
    });
});

app.get('/admin/leaderboard', function(req, res){

    database.connect().then(async e => {
        let leaderboard = await database.getAllTroops();

        res.render('admin_leaderboard.ejs', {
            leaderboard: leaderboard,
        });

    }).catch(error => {
        console.log(error);
        res.sendStatus(400);
    });

});
app.get('/admin/leaderboard/new', function(req, res){
    res.render('admin_new_troop.ejs');
});
app.post('/admin/leaderboard/new', function(req, res){
    database.connect().then(async e => {
        let leaderboard = {
            troop_number: req.body.troop_number,
            troop_guide: req.body.troop_guide,
            session: req.body.session,
            points: 0
        }
        const newTroop = new TROOP(leaderboard);
        newTroop.save();
        res.send('<h2>Troop has been Saved</h2>');
    }).catch(error =>
    {
        res.statusCode = 400;
        res.send('<h2>Troop could not be updated.</h2><br><h4>' + error.message + '</h4>');
    });
});
app.get('/admin/leaderboard/:troopID', function(req, res){
    database.connect().then(async e => {
        let leaderboard = await database.getTroopByID(req.params.troopID);

        res.render('admin_edit_troop.ejs', {
            leaderboard: leaderboard,
        });

    }).catch(error => {
        console.log(error);
    });

});
app.post('/admin/leaderboard/:troopID/update', function(req, res){
    database.connect().then(async e => {
        let leaderboard = await database.getTroopByID(req.params.troopID);

        if(req.body.troop_number && leaderboard.troop_number !== req.body.troop_number)
            leaderboard.troop_number = req.body.troop_number;

        if(req.body.troop_guide && leaderboard.troop_guide !== req.body.troop_guide)
            leaderboard.troop_guide = req.body.troop_guide;

        if(req.body.session && leaderboard.session !== req.body.session)
            leaderboard.session = req.body.session;

        leaderboard.save();
        res.send('<h2>Troop has been Updated</h2>');
    }).catch(error =>
    {
        res.statusCode = 400;
        res.send('<h2>Troop could not be updated.</h2><br><h4>' + error.message + '</h4>');
    });
});
app.post('/admin/leaderboard/:troopID/delete', function(req, res){
    database.connect().then(async e => {
        let leaderboard = await database.getTroopByID(req.params.troopID);
        if(leaderboard !== null) {
            leaderboard.delete().then(err => function () {
                res.send(err);
            });
            res.sendStatus(200);
        }
    }).catch(error =>
    {
        res.statusCode = 400;
        res.send('<h2>Troop could not be updated.</h2><br><h4>' + error.message + '</h4>');
    });
});

app.get('/admin/questions', function(req, res){

    database.connect().then(async e => {
        let questions = await database.getAllQuestions();

        res.render('admin_questions.ejs', {
            questions: questions,
        });

    }).catch(error => {
        console.log(error);
    });

});
app.get('/admin/questions/new', function(req, res){
    res.render('admin_new_question.ejs');
});
app.post('/admin/questions/new', function(req, res){
    database.connect().then(async e => {
        let question = {
            question_text: req.body.question_text,
            question_value: req.body.question_value,
            reusable: req.body.reusable
        };
        const newPost = new QUESTION(question);
        newPost.save();
        res.send(newPost);
    }).catch(error => {
        res.send({
            error: 400,
            message: error
        })
    });
});
app.get('/admin/questions/:questionID', function(req, res){
    database.connect().then(async e => {
        let question = await database.getQuestionByID(req.params.questionID);

        res.render('admin_edit_question.ejs', {
            question: question,
        });

    }).catch(error => {
        console.log(error);
    });

});
app.post('/admin/questions/:questionID/update', function(req, res){
    database.connect().then(async e => {
        let question = await database.getQuestionByID(req.params.questionID);

        if(req.body.question_text && question.question_text !== req.body.question_text)
            question.question_text = req.body.question_text;

        if(req.body.question_value && question.question_value !== req.body.question_value)
            question.question_value = req.body.question_value;

        if(req.body.reusable && question.reusable !== req.body.reusable)
            question.reusable = req.body.reusable;

        question.save();
        res.send('<h2>Question has been Updated</h2>');
    }).catch(error =>
    {
        res.statusCode = 400;
        res.send('<h2>Question could not be updated.</h2><br><h4>' + error.message + '</h4>');
    });
});
app.post('/admin/questions/:questionID/delete', function(req, res){
    database.connect().then(async e => {
        let question = await database.getQuestionByID(req.params.questionID);
        if(question !== null) {
            question.delete().then(err => function () {
                res.send(err);
            });
            res.sendStatus(200);
        }
    }).catch(error =>
    {
        res.statusCode = 400;
        res.send('<h2>Question could not be deleted.</h2><br><h4>' + error.message + '</h4>');
    });
});

app.listen(port, function (err) {
    if (err) {
        throw err
    }
    app.use(cors());

    console.log('Server started on port ' + port)
});