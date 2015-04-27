Install the dependencies with:
`npm install`

Start the server with:
`node automation_metrics_server.js config.js`

This application requires a database with the following two tables:

```sql
CREATE TABLE "testcases" (
    "testcase_id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL ,
    "name" TEXT NOT NULL UNIQUE ON CONFLICT ABORT,
    "description" TEXT
);

CREATE TABLE "execution_history" (
    "tc_id" INTEGER,
    "date" datetime,
    "status" TEXT,
    "execution_time" REAL,
    "error_msg" TEXT
);
```

The database name can be set in the config.js file.
