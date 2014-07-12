# x2db

Import a BigCommerce Excel sheet (xls) into corresponding PostgreSQL tables via this nodejs module. You can repeatedly import newer spreadsheets and the tables should be updated accordingly. Pricing, availability & event dates have been broken out to referencing tables. This is to record historical pricing, availability and event date data for future reporting.

*First*
- `npm install node-getopt`
- `npm install xlsjs`
- `npm install knex --save`
- `npm install pg`
- `npm install bluebird`

*Next*

Import `schema.sql` into postgres

*Finally*

`node x2db.js -f MyExcel.xls --user postgres --pass yescleartext --host 127.0.0.1`

- The `--user`, `--pass` and `--host` relate to postgres  

*todo*
- Populate `product_sku` table
