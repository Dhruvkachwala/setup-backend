const { successColor, errorColor } = require('../helper/color.helper');
const { ROLES } = require('../helper/constant.helper');
const { User, Role } = require('../models');

const adminData = [
    {
        first_name: 'Admin',
        last_name: 'user',
        email: 'admin@gmail.com',
        password: 'Admin@123',
    },
];

/**
 * Admin seeder.
 */
module.exports = adminSeeder = async () => {
    const adminRole = await Role.findOne({ role: ROLES.admin });

    try {
        for (let admin of adminData) {
            const adminExist = await User.findOne({ email: admin.email }); // Get Admin by email.

            if (!adminExist) await User.create({ ...admin, role: adminRole._id }); // If admin doesn't exists, create admin.
        }

        console.log(successColor, '✅ Admin seeder run successfully...');
    } catch (error) {
        console.log(errorColor, '❌ Error from admin seeder :', error);
    }
};
