const mongoose = require("mongoose")

const schema = mongoose.Schema({
	ITEM_ID: String,
	USER_ID: Number,
    EVENT_TYPE:String,
    TIMESTAMP:String,
    DISCOUNT:String
})

module.exports = mongoose.model("Interactions", schema)