var fs = require('fs'),
    globule = require('globule'),
    express = require('express'),
    config = require('./'+process.argv[2]),
    bodyParser = require('body-parser'),
    util = require('util'),
    sqlite3 = require('sqlite3');

var app = express();
var server;
var db = new sqlite3.Database(config.dbName);

//Serve the index.html page
app.use(express.static(__dirname+'/web_app'));
app.use(bodyParser.json());

app.get('/api/getfile', function(req, res) {
    var fullResponse = [];
    var name, sqlSelect;

    name = req.query.files;

    sqlSelect = "Select tc.name, eh.status, eh.date, eh.execution_time from testcases tc, execution_history eh where eh.tc_id = tc.testcase_id and tc.name = ? ORDER BY eh.date ASC";

    //process each row. Could use db.all instead...
    //on completion, send all the rows to the client
    db.each(sqlSelect, ""+name, function(err, row) {
        fullResponse.push(row);
    },
    function(err, numRows) {
	    res.set('Content-Type', 'application/json');
        res.send(JSON.stringify(fullResponse));
    });
});

app.get('/api/getAllTestNames', function(req, res) {
    var sqlGetNames = "Select name from testcases";

    db.all(sqlGetNames, function(err, rows) {
	    res.set('Content-Type', 'application/json');
        res.send(JSON.stringify(rows));
    });

});

app.post('/api/sendfile', function(req, res) {
    var testcaseData = req.body;
    var sqlInsertTestcase, sqlInsertExecutionResult;

    sqlInsertTestcase = "Insert OR IGNORE into testcases (name, description) values ('?', '?');";

    sqlInsertExecutionResult = "Insert into execution_history (tc_id, status, execution_time, date, error_msg) values ((Select testcase_id from testcases where name = '?'), '?', , ?, '?');";

    //serialize db insert to ensure that the test case exists in the testcases table before trying to insert
    //into the execution_history table
    db.serialize(function() {
        db.run(sqlInsertTestcase, testcaseData.name, "");
        db.run(sqlInsertExecutionResult, testcaseData.name, 
            testcaseData.status, testcaseData.execution_time, 
            testcaseData.date, testcaseData.error_info.replace(/'/g, '"'));

        res.writeHead(201, {'Content-Type': 'application/json'});
        res.end();
    })
});

server = app.listen(config.port);
console.log("server listening on port: %d", config.port)
