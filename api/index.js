const fs = require('fs');
const dbSetting = JSON.parse(
    fs.readFileSync('./setting.json', 'utf-8')
).connection;
const mysql = require('mysql');
const connection = mysql.createConnection(dbSetting);
connection.connect((err) => {
    if (err) throw err;
    console.log('Connected!');
    connection.end();
});

