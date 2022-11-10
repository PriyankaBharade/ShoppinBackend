const mongoose = require("mongoose")

const schema = mongoose.Schema({
	USER_ID: Number,
	AGE: Number,
    GENDER:String,
	USED:String,
	NAME:String,
	PERSONA:String,
	DISCOUNT_PERSONA:String,
	BEHAVIOUR_CATEGORY:String

})

module.exports = mongoose.model("Users", schema)