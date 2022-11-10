const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
require('dotenv');
AWS.config.loadFromPath('./config/config.json');
const Items = require("../../models/items.js") // new
const Interactions = require("../../models/interactions.js") // new
const userPersonalize = false; //update this config
const personalizedRecommendation = false;  //update this config
const customerSegmentViewsItems = false;//update this config 
const personalizationService = require("../../services/Personalization.js") // new
const interactionService = require("../../services//Interactions.js") // new
const itemService = require("../../services/Items.js") // new

let sessionObj = {

}
/* AWS.config.getCredentials(function (err) {
   if (err) console.log(err.stack);
   else {
      console.log('Access key:', AWS.config.credentials.accessKeyId);
      console.log('Region:', AWS.config.region);
      console.log("connection successfull");
   }
});*/
module.exports = (app) => {
   app.get('/api/getRecommendation/:userId', async (req, res, next) => {
      let userId = req.params.userId;
      let recommendationResult = [];
      if (userPersonalize) {
         recommendationResult = await personalizationService.getRecommendations(userId);
      }
      else {
         console.log("am running temporary code");
         const interactionType = 'ALL';
         const frequency = 'ALL';
         const uniqueInteraction = true;
         recommendationResult = await interactionService.getInteractions(userId, 10,interactionType,frequency,uniqueInteraction);
      }
      res.json(recommendationResult);
   });
   app.get('/api/getPersonalizedItems/:category/:userId', async (req, res, next) => {
      let category = req.params.category;
      let userId = req.params.userId;
      let recommendationResult = [];
      if (personalizedRecommendation) {
         recommendationResult = await personalizationService.getPersonalizedCategory(category,userId);
      }
      else {
         recommendationResult = await itemService.getItemsbyCategory(category);
      }
      res.json(recommendationResult);
   });
   app.get('/api/getCustomerViewsOnItem/:userId/:itemId', async (req, res, next) => {
      let userId = req.params.userId;
      let itemId = req.params.itemId;
      let recommendationResult = [];
      if (customerSegmentViewsItems) {
         recommendationResult = await personalizationService.getItemsOfInterest(userId, itemId);
      }
      res.json(recommendationResult);
   });
   app.get('/api/getItemsOfInterestFromHistory/:userId/:maxResult', async (req, res, next) => {
      let userId = req.params.userId;
      let maxResult = req.params.maxResult;
      if (customerSegmentViewsItems) {
         recommendationResult = await personalizationService.getItemsOfInterestFromHistory(userId);
         if(recommendationResult.length > maxResult)
         {
            recommendationResult = recommendationResult.slice(0,maxResult)
         }
      }
      else 
      {
         const interactionType = 'ALL';
         const frequency = 'ALL';
         const uniqueInteraction = false;
         recommendationResult = await interactionService.getInteractions(userId, maxResult,interactionType,frequency,uniqueInteraction);

      }      
      res.json(recommendationResult);
      
   });
  
     
   app.get('/api/getItemsInDiscount/:userId/:maxResult', async (req, res, next) => {
      const userId = req.params.userId;
      const maxResult = req.params.maxResult;
      let items = [];
      items = await personalizationService.getItemsInDiscount(userId,personalizedRecommendation,maxResult);
      res.json(items);
   });

   app.get("/api/postEvents/:itemID/:userID/:eventType", async (req, res, next) => {

      const personalizeevents = new AWS.PersonalizeEvents({ apiVersion: '2018-03-22' });
      const itemID = req.params.itemID;
      const userID = req.params.userID;
      const eventType = req.params.eventType;
      // Enable this when recommendation is not available.
      let sessionId = sessionObj[userID];
      if (!sessionId) {
         let myuuid = uuidv4();
         sessionObj[userID] = myuuid;
         sessionId = sessionObj[userID];
      }
      console.log(sessionObj[userID], sessionId);
      let params = {
         eventList: [
            {
               eventType: eventType,
               itemId: itemID,
               sentAt: Date.now(),
               properties: { "discount": "N" }
            },
         ],
         sessionId: sessionId,
         trackingId: '91abd3e2-e193-41d2-8414-22c3a19b0f56',
         userId: userID
      };
      if (userPersonalize) {
         personalizeevents.putEvents(params, async function (err, data) {
            if (err) {
               console.log("am in error putevents", err, err.stack);
            } // an error occurred
            else {
               console.log("success", data);
            }         // successful response
         });

      }
      let newInteraction = new Interactions({
         ITEM_ID: itemID,
         USER_ID: userID,
         EVENT_TYPE: eventType,
         TIMESTAMP: Date.now(),
         DISCOUNT: "N"
      });
      newInteraction.save(function (err, results) {
         console.log(results._id);
      });

      res.send("Success");
   });
};