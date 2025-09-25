const { Permission, AccessPermission, Role } = require('../models');
const { successColor, errorColor } = require('../helper/color.helper');
const { ROLES } = require('../helper/constant.helper');

const permissions = [
    {
        module: 'user',
        permission: 'list',
    },
    {
        module: 'user',
        permission: 'view',
    },
    {
        module: 'user',
        permission: 'create',
    },
    {
        module: 'user',
        permission: 'edit',
    },
    {
        module: 'user',
        permission: 'delete',
    },
];

/**
 * Permissions seeder.
 */
async function permissionsSeeder() {
    try {
        // find new permissions
        const newPermissions = [];
        for (const item of permissions) {
            const existsPermission = await Permission.findOne({
                module: item.module,
                permission: item.permission,
            });

            if (!existsPermission) {
                newPermissions.push({
                    slug: `${item.module}_${item.permission}`,
                    module: item.module,
                    permission: item.permission,
                });
            }
        }
        await Permission.create(newPermissions);
        console.log(successColor, '✅ Permission seeder run successfully...');
    } catch (error) {
        console.log(errorColor, '❌ Error from Permission seeder :', error);
    }
}

/**
 * Access permissions seeder.
 */
async function accessPermissionsSeeder() {
    try {
        const adminRole = await Role.findOne({ slug: ROLES.admin }); // Get admin role.

        const allPermission = await Permission.find(); // Get all permissions.

        const accessPermissions = Array.from(allPermission, (p) => ({
            role: adminRole._id,
            permission: p._id,
        }));

        const newAccessPermission = [];

        for (const ap of accessPermissions) {
            const apFound = await AccessPermission.findOne({
                role: ap.role,
                permission: ap.permission,
            });
            if (!apFound)
                newAccessPermission.push({
                    role: ap.role,
                    permission: ap.permission,
                });
        }
        await AccessPermission.create(newAccessPermission);

        console.log(successColor, '✅ Access permission seeder run successfully...');
    } catch (error) {
        console.log(errorColor, '❌ Error from access permission seeder :', error);
    }
}

module.exports = {
    permissionsSeeder,
    accessPermissionsSeeder,
};
