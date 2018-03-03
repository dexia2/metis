// read setting
const fs = require('fs');
const setting = JSON.parse(
    fs.readFileSync('./setting.json', 'utf-8')
);

// init express
const express = require('express');
const app = express();

// use body-parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// run server
const server = app.listen(setting.server.port, () => {
    console.log('Listening to PORT:' + server.address().port);
});

// run mysql query
const dbSetting = setting.connection;
const mysql = require('mysql');
const runDbAction = (command, params) =>
     new Promise((resolve, reject) => {
        const connection = mysql.createConnection(dbSetting);
        connection.connect(connectErr => {
            if (connectErr) reject(connectErr);
            connection.query(
                command, params,
                (execError, results, fields) =>  {
                    connection.end();
                    if(execError) reject(execError);
                    resolve(results);
                });
        });
    });

// define error
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
    this.name = 'NotFoundError';
  }
}

// series get
app.get("/api/series", (req, res, next) => {

    const command = 'select * from series';
    runDbAction(command, [])
        .then(results => res.status(200).json(results));

});

// series post
const checkSeries = body => ['name'].every(c => body[c]);
app.post('/api/series', (req, res) =>  {

    if(!checkSeries(req.body)) {
        res.status(400).send({ error: 'required columns not filled'});
        return;
    }

    const command = 'insert into series set ?';
    const params = {
        name: req.body.name,
        latest: req.body.latest || 1,
        period: req.body.period || 3,
        subscribe: req.body.subscribe || '0',
        purchased: req.body.purchased || new Date(9999, 12, 31),
        published: req.body.published || new Date(9999, 12, 31),
        author: req.body.author || ''
    };

    runDbAction(command, params)
        .then(_ => res.status(201).send());

});

// series put
const newSeries = (req, old) => ({
        id: req.body.id,
        name: req.body.name || old.name,
        latest: req.body.latest || old.latest,
        period: req.body.period || old.period ,
        subscribe: req.body.subscribe || old.subscribe,
        purchased: req.body.purchased || old.purchased,
        published: req.body.published || old.published,
        author: req.body.author || old.author
    });
app.put("/api/series", (req, res, next) => {

    if(!req.body.id) {
        res.status(400).send({ error: 'id required'});
        return;
    }

    const selectCommand = 'select * from `series` WHERE `id` = ?';
    const updateCommand = 'update series set name = ?, latest = ?, period = ?, subscribe = ?, purchased = ?, published = ?, author = ? where id = ?';

    // confirm exists
    runDbAction(selectCommand, [req.body.id])
        .then(results => {
            if(!results.length) throw new NotFoundError('not found');

            // do update
            const newRecord = newSeries(req, results[0]);
            return runDbAction(updateCommand,
                               [newRecord.name,
                                newRecord.latest,
                                newRecord.period,
                                newRecord.subscribe,
                                newRecord.purchased,
                                newRecord.published,
                                newRecord.author,
                                newRecord.id]);
        })
        .then(_ => res.status(204).send())
        .catch(err => {

            // return not found
            if(err.name === 'NotFoundError') {
                res.status(404).send();
            } else {
                setTimeout(() => { throw err; });
            }
        });

});

// recommend get
app.get("/api/recommend", (req, res, next) => {

    const command = "select * from series where date_sub(now(), interval period month) > published and subscribe = '1' ";
    runDbAction(command, [])
        .then(results => res.status(200).json(results));

});
