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
const runDbAction = (sql, params) =>
     new Promise((resolve, reject) => {
        const connection = mysql.createConnection(dbSetting);
        connection.connect(connectErr => {
            if (connectErr) reject(connectErr);
            connection.query(
                sql, params,
                (execError, results, fields) =>  {
                    connection.end();
                    if(execError) reject(execError);
                    resolve(results);
                });
        });
    });

// series post
const checkSeries = body => ['name', 'latest', 'period'].every(c => body[c]);
app.post('/api/series', (req, res) =>  {

    if(!checkSeries(req.body)) {
        res.status(400).send({ error: 'required columns not filled'});
        return;
    }

    const sql = 'insert into series set ?';
    const params = {
        name: req.body.name,
        latest: req.body.latest,
        period: req.body.period,
        subscribe: req.body.subscribe || '0'
    };

    runDbAction(sql, params)
        .then(_ => res.status(201).send());

});

// series get
app.get("/api/series", (req, res, next) => {

    const sql = 'select * from series';
    const connection = mysql.createConnection(dbSetting);
    runDbAction(sql, [])
        .then(results => res.status(200).json(results));

});


