const Interactions = require("../models/interactions.js") // new
const itemService = require("../services/Items.js") // new
const userService = require("./Users.js") // new

module.exports.getInteractions = async (userId, limit, interactionType, frequency, uniqueInteraction) => {
    let query = { USER_ID: userId };
    if (interactionType != 'ALL') {
        query = { USER_ID: userId, EVENT_TYPE: interactionType };
    }
    let interactions = await Interactions.find(query).sort({ "TIMESTAMP": -1 }).limit(limit);
    let interactionItemsArr = []
    interactions.forEach((interaction) => {
        interactionItemsArr.push(interaction.ITEM_ID)
    });
    let interactionResults = [];
    let uniqueObj = {};
    if (interactionItemsArr.length > 0) {
        let itemsMetadataObj = await itemService.getItemsByList(interactionItemsArr);
        interactions.forEach((interaction) => {
            let tempObj = {};
            let item_id = interaction.ITEM_ID
            tempObj["ITEM_ID"] = interaction.ITEM_ID;
            tempObj["USER_ID"] = interaction.USER_ID;
            tempObj["EVENT_TYPE"] = interaction.EVENT_TYPE;
            tempObj["TIMESTAMP"] = interaction.TIMESTAMP;
            tempObj['PRICE'] = itemsMetadataObj[item_id]['PRICE'];
            tempObj['CATEGORY_L1'] = itemsMetadataObj[item_id]['CATEGORY_L1'];
            tempObj['CATEGORY_L2'] = itemsMetadataObj[item_id]['CATEGORY_L2'];
            tempObj['PRODUCT_NAME'] = itemsMetadataObj[item_id]['PRODUCT_NAME'];
            tempObj['PRODUCT_DESCRIPTION'] = itemsMetadataObj[item_id]['PRODUCT_DESCRIPTION'];
            tempObj['FREQUENCY'] = itemsMetadataObj[item_id]['FREQUENCY'];
            tempObj['DISCOUNT'] = itemsMetadataObj[item_id]['DISCOUNT'];
            tempObj['DISCOUNT_PERCENT'] = itemsMetadataObj[item_id]['DISCOUNT_PERCENT'];
            if (frequency == 'ALL' || frequency == tempObj['FREQUENCY']) {
                if (uniqueInteraction) {
                    if (!uniqueObj[item_id]) {

                        uniqueObj[item_id] = item_id;
                        interactionResults.push(tempObj);
                    }
                }
                else {
                    interactionResults.push(tempObj);
                }
            }
        })
    }
    return (interactionResults);
};
module.exports.pickUpWhereyouLeft = (items, maxResult) => {
    let excludeItems = [];
    let uniqueItems = [];
    let indexLength = 0;
    console.log("maxResult", maxResult);
    items.forEach((item) => {
        if (item.EVENT_TYPE == "Purchase") {
            excludeItems.push(item.ITEM_ID);
        }
    })
    let filteredItems = [];
    items.forEach((item) => {
        if (!excludeItems.includes(item.ITEM_ID)
            && !uniqueItems.includes(item.ITEM_ID)) {
            if (indexLength < maxResult) {
                filteredItems.push(item);
                uniqueItems.push(item.ITEM_ID);
                indexLength++;
            }
        }
    })
    return (filteredItems);
};
module.exports.getTrendingInteractions = async (itemLimit, interactionType, userId) => {
    let query = { EVENT_TYPE: interactionType };
    const getUserPref = await userService.getUserDetails(userId);
    let categoryBestSellers = {};
    let categoryList = [];
    if (getUserPref.length > 0 && getUserPref[0]["PERSONA"] && getUserPref[0]["PERSONA"] != "") {
        categoryList = getUserPref[0]["PERSONA"].split("_");
    }
    categoryList.forEach((category) => {
        categoryBestSellers[category] = [];
    })
    let interactions = await Interactions.find(query).sort({ "TIMESTAMP": -1 }).limit(itemLimit);
    let interactionItemsArr = [];
    let interactionCount = {};
    interactions.forEach((interaction) => {
        if (interactionCount[interaction.ITEM_ID]) {
            interactionCount[interaction.ITEM_ID] = interactionCount[interaction.ITEM_ID] + 1;
        }
        else {
            interactionCount[interaction.ITEM_ID] = 1;
        }
    });
    let sortedInteractions = [];
    for (var i in interactionCount) {
        sortedInteractions.push([i, interactionCount[i]]);
    }

    sortedInteractions.sort(function (a, b) {
        return b[1] - a[1];
    });

    sortedInteractions = sortedInteractions.slice(0, 100);
    sortedInteractions.forEach((item) => {
        interactionItemsArr.push(item[0]);
    })

    let frequentItems = [];
    let occasionalProducts = [];
    if (interactionItemsArr.length > 0) {
        let itemsMetadataObj = await itemService.getItemsByList(interactionItemsArr);
        sortedInteractions.forEach((interaction) => {
            let tempObj = {};
            let item_id = interaction[0];
            tempObj["ITEM_ID"] = item_id;
            tempObj["PURCHASECOUNT"] = interaction[1];
            tempObj['PRICE'] = itemsMetadataObj[item_id]['PRICE'];
            tempObj['CATEGORY_L1'] = itemsMetadataObj[item_id]['CATEGORY_L1'];
            tempObj['CATEGORY_L2'] = itemsMetadataObj[item_id]['CATEGORY_L2'];
            tempObj['PRODUCT_NAME'] = itemsMetadataObj[item_id]['PRODUCT_NAME'];
            tempObj['PRODUCT_DESCRIPTION'] = itemsMetadataObj[item_id]['PRODUCT_DESCRIPTION'];
            tempObj['FREQUENCY'] = itemsMetadataObj[item_id]['FREQUENCY'];
            tempObj['DISCOUNT'] = itemsMetadataObj[item_id]['DISCOUNT'];
            tempObj['DISCOUNT_PERCENT'] = itemsMetadataObj[item_id]['DISCOUNT_PERCENT'];
            if (tempObj['FREQUENCY'] == "Frequent") {
                frequentItems.push(tempObj);
            }
            else {
                if (!categoryBestSellers[tempObj['CATEGORY_L1']]) {
                    occasionalProducts.push(tempObj);
                }
            }
            if (categoryBestSellers[tempObj['CATEGORY_L1']] && categoryBestSellers[tempObj['CATEGORY_L1']].length < 4) {
                categoryBestSellers[tempObj['CATEGORY_L1']].push(tempObj);
            }

        })
    }
    return ({
        frequentItems: frequentItems,
        occasionalProducts: occasionalProducts,
        categoryBestSellers: categoryBestSellers
    });
};