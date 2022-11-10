const Items = require("../models/items.js") // new
const userService = require("./Users.js") // new

module.exports.getItems = async () => {
    const items = await Items.find();
    return (items);
};
module.exports.getItemsbyCategory = async (category) => {
    const query = { CATEGORY_L1: category };
    const items = await Items.find(query);
    return (items);
};
module.exports.getItemsbySubCategory = async (category, subcategory) => {
    const query = { CATEGORY_L1: category, CATEGORY_L2: subcategory };
    const items = await Items.find(query);
    return (items);
};
module.exports.getUniqueCategory = async () => {
    const distinctCategory = await Items.distinct('CATEGORY_L1');
    return(distinctCategory);
};
module.exports.getSubcategoryList = async (category) => {
    const query = { CATEGORY_L1: category };
    const distinctSubCategory = await Items.find(query).distinct('CATEGORY_L2');
    return(distinctSubCategory);
};
module.exports.getItemsByList = async (interactionItemsArr) => {
    const query = { ITEM_ID: interactionItemsArr };
    const itemsMetadataArr = await Items.find(query);
    let itemsMetadataObj = {};
    itemsMetadataArr.forEach(il => {
        itemsMetadataObj[il.ITEM_ID] = il;
    });
    return (itemsMetadataObj);
};
module.exports.getItemsInDiscount = async (userId) => {
    let query = { DISCOUNT :'YES'};
    const getUserPref = await userService.getUserDetails(userId);
    if(getUserPref.length > 0 && getUserPref[0]["PERSONA"] && getUserPref[0]["PERSONA"] != "")
    {
        let categoryList = getUserPref[0]["PERSONA"].split("_");
        query = { DISCOUNT :'YES', CATEGORY_L1 : categoryList}
    }
    const items = await Items.find(query).limit(400);
    return (items);
};