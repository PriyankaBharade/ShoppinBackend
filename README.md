Import to mongodb-

use retail_demov1
commands to import data to dbs-
mongoimport --db retail_demov1 --collection items --type=csv --headerline --file=items_to_db.csv
mongoimport --db retail_demov1 --collection interactions --type=csv --headerline --file=interactions.csv
mongoimport --db retail_demov1 --collection users --type=csv --headerline --file=users_to_db.csv



Images urls -
https://d22kv7nk938ern.cloudfront.net/images/Category/fileName.jpg

Example - https://d22kv7nk938ern.cloudfront.net/images/accessories/da1f2a8f-5372-4102-b357-9e40900ebb08.jpg