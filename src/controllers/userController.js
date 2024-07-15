const User = require('../models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const users = require('./sampleUsers.json'); // Adjust the path to your JSON file

async function viewDashboard(req, res) {
    try {
        const admins = await User.find({isAdmin : true}).lean();
        const adminCount = admins.length;

        const nonAdmins = await User.find({isAdmin : false}).lean();
        const nonAdminCount = nonAdmins.length;
        console.log(admins);
        console.log(nonAdmins);
        console.log("Admins: " + adminCount + " Non-admins: " + nonAdminCount);


        res.render('users', { adminCount, admins, nonAdminCount, nonAdmins });  // Pass the admins to the 'users' template
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error!");
    }
}


async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

async function createUsers() {
    try {
        await mongoose.connect('mongodb://localhost:27017/yourDatabaseName', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        for (let user of users) {
            user.password = await hashPassword(user.password);
            const newUser = new User(user);
            await newUser.save();
        }

        console.log('Users have been created');
        mongoose.disconnect();
    } catch (error) {
        console.error('Error creating users:', error);
    }
}

createUsers();


module.exports = {
    viewDashboard
}