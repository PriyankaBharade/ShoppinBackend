const mongoose = require("mongoose")

const schema = mongoose.Schema({
	ITEM_ID: String,
	PRICE: Number,
    CATEGORY_L1:String,
    CATEGORY_L2:String,
    PRODUCT_DESCRIPTION:String,
    GENDER:String,
    PRODUCT_NAME:String,
    FREQUENCY:String,
    DISCOUNT:String,
    DISCOUNT_PERCENT:Number
})

module.exports = mongoose.model("Items", schema)