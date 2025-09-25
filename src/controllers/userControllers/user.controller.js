const httpStatus = require('http-status');
const { userService, fileService } = require('../../services');
const catchAsync = require('../../utils/catchAsync');
const { FILES_FOLDER, FILE_QUALITY, FILE_SIZE } = require('../../helper/constant.helper');
const { generateMessage } = require('../../helper/function.helper');
const {
    saveFile,
    compressFileUsingBuffer,
    compressFile,
    compressFileUsingPath,
    resizeFileUsingPath,
    resizeFileUsingBuffer,
} = require('../../services/files.service');

module.exports = {
    /**
     * Get: Get user.
     */
    getUser: catchAsync(async (req, res) => {
        res.status(httpStatus.OK).json({
            success: true,
            message: generateMessage('get', 'user'),
            data: req.user,
        });
    }),

    /**
     * PUT: Update user.
     * Only original file save
     */
    // updateUser: catchAsync(async (req, res) => {
    //     const { user, body, file } = req;

    //     if (file) {
    //         body.image = saveFile({
    //             folderName: FILES_FOLDER.userImages,
    //             innerFolderName: String(user._id),
    //             file,
    //         }).name;

    //         if (user?.image) {
    //             const split = user.image.split(FILES_FOLDER.userImages);

    //             if (split[1]) {
    //                 await fileService.deleteFile(
    //                     `./${FILES_FOLDER.public}/${FILES_FOLDER.userImages}${split[1]}`
    //                 );
    //             }
    //         } // If an old user image exists, delete the user image.
    //     }

    //     await userService.updateUserById(user._id, body); // Update user by _id.

    //     res.status(httpStatus.OK).json({
    //         success: true,
    //         message: generateMessage('updated', 'user'),
    //     });
    // }),

    /**
     * PUT: Update user.
     * Only compress/resize file save.
     */
    // updateUser: catchAsync(async (req, res) => {
    //     const { user, body, file } = req;

    //     if (file) {
    //         const smallFile = await compressFileUsingBuffer(
    //             {
    //                 folderName: FILES_FOLDER.userImages,
    //                 innerFolderName: String(user._id),
    //                 file,
    //             },
    //             FILE_QUALITY.small
    //         );
    //         // const smallFile = await resizeFileUsingBuffer(
    //         //     {
    //         //         folderName: FILES_FOLDER.userImages,
    //         //         innerFolderName: String(user._id),
    //         //         file,
    //         //     },
    //         //     FILE_SIZE.small
    //         // );

    //         body.image = smallFile;

    //         if (user?.image) {
    //             const split = user.image.split(FILES_FOLDER.userImages);

    //             if (split[1]) {
    //                 await fileService.deleteFiles([
    //                     `./${FILES_FOLDER.public}/${FILES_FOLDER.userImages}${split[1]}`,
    //                     `./${FILES_FOLDER.public}/${FILES_FOLDER.userImages}${split[1].replace(
    //                         'org',
    //                         FILE_QUALITY.small.type
    //                     )}`,
    //                 ]);
    //             }
    //         } // If an old user image exists, delete the user image.
    //     }

    //     await userService.updateUserById(user._id, body); // Update user by _id.

    //     res.status(httpStatus.OK).json({
    //         success: true,
    //         message: generateMessage('updated', 'user'),
    //     });
    // }),

    /**
     * PUT: Update user.
     * Original with compress/resize file save.
     */
    updateUser: catchAsync(async (req, res) => {
        const { user, body, file } = req;

        if (file) {
            const { name, path } = saveFile({
                folderName: FILES_FOLDER.userImages,
                innerFolderName: String(user._id),
                file,
            });

            body.image = name;

            await compressFileUsingPath(path, FILE_QUALITY.small);
            // await resizeFileUsingPath(path, FILE_SIZE.small);

            if (user?.image) {
                const split = user.image.split(FILES_FOLDER.userImages);

                if (split[1]) {
                    await fileService.deleteFiles([
                        `./${FILES_FOLDER.public}/${FILES_FOLDER.userImages}${split[1]}`,
                        `./${FILES_FOLDER.public}/${FILES_FOLDER.userImages}${split[1].replace(
                            'org',
                            FILE_QUALITY.small.type
                        )}`,
                    ]);
                }
            } // If an old user image exists, delete the user image.
        }

        await userService.updateUserById(user._id, body); // Update user by _id.

        res.status(httpStatus.OK).json({
            success: true,
            message: generateMessage('updated', 'user'),
        });
    }),
};
