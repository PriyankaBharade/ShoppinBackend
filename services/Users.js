const Users = require("../models/users.js") // new

module.exports.getUsers =  async (userType) =>{ 
    const users = await Users.find().limit(100).sort("USER_ID");
    console.log(users);
    return(users);
};
module.exports.getUsersWithTransaction =  async () =>{ 
    const query = { 'USED': 'Y' };
    const users = await Users.find(query).limit(100).sort({ "USER_ID": -1 });
    return(users);
};
module.exports.getNewUsers =  async () =>{ 
    const query = { 'USED': 'N' };
    const users = await Users.find(query).limit(100);
    return(users);
};
module.exports.getUserDetails =  async (userId) =>{ 
    const query = { 'USER_ID': userId };
    const users = await Users.find(query);
    return(users);
};
module.exports.signupUser =  async (userId) =>{ 
    let myQuery = { USER_ID: userId };
    let newValues = { $set: { 'USED': 'Y' } };
    await Users.updateOne(myQuery, newValues);
    const users = await Users.find(myQuery);
    console.log(users);
    return(users);
};