Automation Web Server
===================

Install the dependencies with:
```
npm install
```

Start the server with:
```
node server/automation_metrics_server.js config.js
```

This application requires a database with the following two tables:
```sql
CREATE TABLE "testcases" (
    "testcase_id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL ,
    "name" TEXT NOT NULL UNIQUE ON CONFLICT ABORT,
    "description" TEXT
);
```

```sql
CREATE TABLE "execution_history" (
    "tc_id" INTEGER,
    "date" INTEGER,
    "status" TEXT,
    "execution_time" REAL,
    "error_msg" TEXT
);
```

The database name can be set in the config.js file.

During development, if you want to automatically run the gulp tasks for minifying CSS and uglifying JS then you will need the following gulp task running:
```
gulp watch
```
