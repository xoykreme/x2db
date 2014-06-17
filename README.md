# [x2db]

Import a customised Excel sheet (xls) into corresponding PostgreSQL tables via this nodejs module. You can repeatedly import newer spreadsheets and the tables should be updated accordingly. Pricing, availability & event dates have been broken out to referencing tables in anticipation of the need to have historical and immutable data for further analysis.

3Ds threw down a dusty gauntlet... and this sprung up :)

*First*
- `npm install xlsjs`
- `npm install knex --save`
- `npm install bookshelfjs --save`
- `npm install pg`
- `npm install bluebird`
- `npm install longjohn`

*Next*
Import `schema.sql` into postgres

*Finally*
`node x2db.js -f MyExcel.xls --user postgres --pass yescleartext --host 127.0.0.1`

- The `--user`, `--pass` and `--host` relate to postgres  

*fyi*
- Async concurrency might mean race conditions preventing a small number of rows to not be imported.   
