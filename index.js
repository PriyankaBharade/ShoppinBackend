const express = require('express')
const cors = require('cors')
const app = express()
const mongoose = require("mongoose");

app.use(express.static('public'))
// Set up default mongoose connection
const mongoDB = "mongodb://127.0.0.1:27017/retail_demov1";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

// Get the default connection
const db = mongoose.connection;


app.use(cors())
const isDev = process.env.NODE_ENV !== 'production';
const port  = process.env.PORT || 3002;

// Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// API routes
require('./routes')(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})