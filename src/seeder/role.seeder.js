const { successColor, errorColor } = require('../helper/color.helper');
const { ROLES } = require('../helper/constant.helper');
const { generateSlug } = require('../helper/function.helper');
const Role = require('../models/role.model');

/**
 * Role seeder.
 */
module.exports = roleSeeder = async () => {
    try {
        const rolesData = Object.values(ROLES); // Get all role name.

        for (let role of rolesData) {
            const alreadyExist = await Role.findOne({ role }); // Get role by role name.

            if (!alreadyExist) await Role.create({ role, slug: generateSlug(role) }); // If role doesn't exists, create role.
        }

        console.log(successColor, '✅ Role seeder run successfully...');
    } catch (error) {
        console.log(errorColor, '❌ Error from role seeder :', error);
    }
};
