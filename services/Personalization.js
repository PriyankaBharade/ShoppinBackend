const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
require('dotenv');
AWS.config.loadFromPath('./config/config.json');
const recomenderArn = "arn:aws:personalize:us-east-1:138897286986:recommender/recommendation-for-you";
const personalizedRankingArn = "arn:aws:personalize:us-east-1:138897286986:campaign/my-personalized-campaign";
const customerItemCollabArn = "arn:aws:personalize:us-east-1:138897286986:recommender/customer-item-segment";
const personalizeRuntime = new AWS.PersonalizeRuntime({ apiVersion: '2018-05-22' });
const itemService = require("./Items.js") // new
const Interactions = require("../models/interactions.js") // new
const displayOccasionalProducts = "arn:aws:personalize:us-east-1:138897286986:filter/my-category-filter";

async function getPersonalizedRanking(itemIdList, userId) {
    let params = {
        campaignArn: personalizedRankingArn,
        userId: userId,
        inputList: itemIdList
    };
    const personalizedScores = await personalizeRuntime.getPersonalizedRanking(params).promise();
    return (personalizedScores);
}
async function getPersonalizedRankingWithContext(itemIdList, userId) {
    let params = {
        campaignArn: personalizedRankingArn,
        userId: userId,
        inputList: itemIdList //,context : {'DISCOUNT': 'Yes'}
    };
    const personalizedScores = await personalizeRuntime.getPersonalizedRanking(params).promise();
    return (personalizedScores);
}

async function getDomainRecommendations(params) {
    let recommendationResult = [];
    const recommendations = await personalizeRuntime.getRecommendations(params).promise();
    if (recommendations && recommendations.itemList && recommendations.itemList.length > 0) {
        let itemDescriptionArr = [];
        recommendations.itemList.forEach((recommendation) => {
            itemDescriptionArr.push(recommendation.itemId)
        });
        if (itemDescriptionArr.length > 0) {
            let itemsMetadataObj = await itemService.getItemsByList(itemDescriptionArr);
            recommendations.itemList.forEach((recommendation) => {
                let tempObj = {};
                let item_id = recommendation.itemId;
                tempObj["ITEM_ID"] = recommendation.itemId;
                tempObj['PRICE'] = itemsMetadataObj[item_id]['PRICE'];
                tempObj['CATEGORY_L1'] = itemsMetadataObj[item_id]['CATEGORY_L1'];
                tempObj['CATEGORY_L2'] = itemsMetadataObj[item_id]['CATEGORY_L2'];
                tempObj['PRODUCT_DESCRIPTION'] = itemsMetadataObj[item_id]['PRODUCT_DESCRIPTION'];
                tempObj['PRODUCT_NAME'] = itemsMetadataObj[item_id]['PRODUCT_NAME'];
                tempObj['FREQUENCY'] = itemsMetadataObj[item_id]['FREQUENCY'];
                tempObj['DISCOUNT'] = itemsMetadataObj[item_id]['DISCOUNT'];
                tempObj['DISCOUNT_PERCENT'] = itemsMetadataObj[item_id]['DISCOUNT_PERCENT'];
                recommendationResult.push(tempObj);
            })
        }
    }
    return recommendationResult;
}
module.exports.getRecommendations = async (userId) => {
    let params = {
        recommenderArn: recomenderArn,
        userId: userId 
    };
    const query = { USER_ID: userId };
    let interactions = await Interactions.find(query).limit(1);
    if(interactions.length == 0)
    {
        console.log("interactions count is 0 and hence applying filter");
        params = {
            recommenderArn: recomenderArn,
            userId: userId,
            filterArn : displayOccasionalProducts 
        };
    }
    let recommendationResult = await getDomainRecommendations(params);
    return (recommendationResult);
}
module.exports.getItemsOfInterest = async (userId, itemId) => {
    let params = {
        recommenderArn: customerItemCollabArn,
        userId: userId,
        itemId: itemId
    };
    let recommendationResult = await getDomainRecommendations(params);
    return (recommendationResult);
}
module.exports.getItemsOfInterestFromHistory = async (userId) => {
    let limitInteraction = 1;
    let recommendationResult = [];
    const query = { USER_ID: userId };
    let interactions = await Interactions.find(query).sort({ "TIMESTAMP": -1 }).limit(limitInteraction);
    console.log(interactions)
    let itemId = interactions[0].ITEM_ID;
    let params = {
        recommenderArn: customerItemCollabArn,
        userId: userId,
        itemId: itemId
    };    
    recommendationResult = await getDomainRecommendations(params);
    return (recommendationResult);
}
module.exports.getPersonalizedCategory = async (category, userId) => {
    let items = [];
    items = await itemService.getItemsbyCategory(category);
    let itemIdList = [];
    let itemsMetadataObj = {};
    items.forEach((itemId) => {
        itemIdList.push(itemId.ITEM_ID)
        itemsMetadataObj[itemId.ITEM_ID] = itemId;
    });
    let personalizedScores = await getPersonalizedRanking(itemIdList, userId)
    let recommendationResult = [];
    personalizedScores.personalizedRanking.forEach((personalizedItem) => {
        let tempObj = {};
        let ITEM_ID = personalizedItem.itemId;
        tempObj["ITEM_ID"] = personalizedItem.itemId;
        tempObj["SCORE"] = personalizedItem.score;
        tempObj['PRICE'] = itemsMetadataObj[ITEM_ID]['PRICE'];
        tempObj['CATEGORY_L1'] = itemsMetadataObj[ITEM_ID]['CATEGORY_L1'];
        tempObj['CATEGORY_L2'] = itemsMetadataObj[ITEM_ID]['CATEGORY_L2'];
        tempObj['PRODUCT_DESCRIPTION'] = itemsMetadataObj[ITEM_ID]['PRODUCT_DESCRIPTION'];
        tempObj['PRODUCT_NAME'] = itemsMetadataObj[ITEM_ID]['PRODUCT_NAME'];
        tempObj['FREQUENCY'] = itemsMetadataObj[ITEM_ID]['FREQUENCY'];
        tempObj['DISCOUNT'] = itemsMetadataObj[ITEM_ID]['DISCOUNT'];
        tempObj['DISCOUNT_PERCENT'] = itemsMetadataObj[ITEM_ID]['DISCOUNT_PERCENT'];
        recommendationResult.push(tempObj);
    });
    return(recommendationResult);
}
module.exports.getItemsInDiscount = async (userId,personalizedRecommendationFlag,maxResult) => {
    const items = await itemService.getItemsInDiscount(userId);
    
    let recommendationResult = [];
    let resultsCount = 0;
    if(personalizedRecommendationFlag)
    {
        let itemsMetadataObj = {};
        items.forEach(il => {
            itemsMetadataObj[il.ITEM_ID] = il;
        });
        let itemIdList = [];
        items.forEach((itemId) => {
            itemIdList.push(itemId.ITEM_ID)
            itemsMetadataObj[itemId.ITEM_ID] = itemId;
        });
        let personalizedScores = await getPersonalizedRankingWithContext(itemIdList, userId)
        personalizedScores.personalizedRanking.forEach((personalizedItem) => {
            if(resultsCount < maxResult)
            {
                let tempObj = {};
                let ITEM_ID = personalizedItem.itemId;
                tempObj["ITEM_ID"] = personalizedItem.itemId;
                tempObj["SCORE"] = personalizedItem.score;
                tempObj['PRICE'] = itemsMetadataObj[ITEM_ID]['PRICE'];
                tempObj['CATEGORY_L1'] = itemsMetadataObj[ITEM_ID]['CATEGORY_L1'];
                tempObj['CATEGORY_L2'] = itemsMetadataObj[ITEM_ID]['CATEGORY_L2'];
                tempObj['PRODUCT_DESCRIPTION'] = itemsMetadataObj[ITEM_ID]['PRODUCT_DESCRIPTION'];
                tempObj['PRODUCT_NAME'] = itemsMetadataObj[ITEM_ID]['PRODUCT_NAME'];
                tempObj['FREQUENCY'] = itemsMetadataObj[ITEM_ID]['FREQUENCY'];
                tempObj['DISCOUNT'] = itemsMetadataObj[ITEM_ID]['DISCOUNT'];
                tempObj['DISCOUNT_PERCENT'] = itemsMetadataObj[ITEM_ID]['DISCOUNT_PERCENT'];
                recommendationResult.push(tempObj);
                resultsCount++;
            }
           
        });
    }
    else 
    {
        recommendationResult = items.slice(0,maxResult);
    }
    
    return (recommendationResult);
};