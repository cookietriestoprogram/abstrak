const User = require('../models/User');

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

module.exports = {
    viewDashboard
}