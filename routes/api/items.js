const itemService = require("../../services/Items.js") // new
module.exports = (app) => {
   app.get('/api/getItems', async (req, res, next) => {
      let items = [];
      items = await itemService.getItems();
      res.json(items);
   });
   app.get('/api/getUniqueCategory', async (req, res, next) => {
      let category = [];
      category = await itemService.getUniqueCategory();
      res.json(category);
   });
   app.get('/api/getItems/:category', async (req, res, next) => {
      const category = req.params.category;
      let items = [];
      items = await itemService.getItemsbyCategory(category);
      res.json(items);
   });
   app.get('/api/getItems/:category/:subcategory', async (req, res, next) => {
      const category = req.params.category;
      const subcategory = req.params.subcategory;
      let items = [];
      items = await itemService.getItemsbySubCategory(category,subcategory);
      res.json(items);
   });

   app.get('/api/getSubcategory/:category', async (req, res, next) => {
      const category = req.params.category;
      let items = [];
      items = await itemService.getSubcategoryList(category);
      res.json(items);
   }); 
};
