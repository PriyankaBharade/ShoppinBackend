const userService = require("../../services/Users.js") // new

module.exports = (app) => {
    app.get('/api/getUsers', async (req, res, next) => {
        let users = [];
        users = await userService.getUsers();
        res.json(users);
    });
    app.get('/api/getUsersWithTransaction', async (req, res, next) => {
        let users = [];       
        users = await userService.getUsersWithTransaction();
        res.json(users);
    });
    app.get('/api/getNewUsers', async (req, res, next) => {
        let users = [];       
        users = await userService.getNewUsers();
        res.json(users);
    });
    app.get('/api/signupUser/:userId', async (req, res, next) => {
        let userId = req.params.userId;
        let users = await userService.signupUser(userId);
        res.json(users);
    });
};