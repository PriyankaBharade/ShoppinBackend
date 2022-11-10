
const interactionService = require("../../services/Interactions.js") // new

module.exports = (app) => {    
    app.get('/api/getInteractions/:userId', async (req, res, next) => {
        const userId = req.params.userId;
        const interactionType = 'ALL';
        const frequency = 'ALL';
        const uniqueInteraction = false;
        let resultsArr = await interactionService.getInteractions(userId, 50,interactionType,frequency,uniqueInteraction);
        res.json({
            interactionItems : resultsArr
        });
    });
    app.get('/api/frequentPurchaseItems/:userId/:maxResult', async (req, res, next) => {
        const userId = req.params.userId;
        const maxResult = req.params.maxResult;
        const interactionType = 'Purchase';
        const frequency = 'Frequent';
        const itemLimit = 50;
        const uniqueInteraction = true;
        let items = await interactionService.getInteractions(userId, itemLimit,interactionType,frequency,uniqueInteraction);
        items = items.slice(0,maxResult);
        res.json(items);
     });
     app.get('/api/pickUpWhereyouLeft/:userId/:maxResult', async (req, res, next) => {
        const userId = req.params.userId;
        const maxResult = req.params.maxResult;
        const interactionType = 'ALL';
        const itemLimit = 50;
        const frequency = 'ALL';
        const uniqueInteraction = false;
        let items = await interactionService.getInteractions(userId, itemLimit,interactionType,frequency,uniqueInteraction);
        let filteredItems = interactionService.pickUpWhereyouLeft(items,maxResult);
        res.json(filteredItems);
     });
     app.get('/api/getTrendingsItems/:userId',async(req,res,next)=>{
        const userId = req.params.userId;
        const interactionType = 'Purchase';
        const itemLimit = 1000;
        const frequency = 'ALL';
        let trendingObj = await interactionService.getTrendingInteractions(itemLimit,interactionType,userId);
        res.json({
            frequentItems : trendingObj.frequentItems.slice(0,20),
            occasionalProducts : trendingObj.occasionalProducts.slice(0,20),
            categoryBestSellers : trendingObj.categoryBestSellers
        });
     })
};
