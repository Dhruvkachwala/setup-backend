const multer = require('multer');
const ApiError = require('../utils/apiError');
const httpStatus = require('http-status');
const { FILE_EXTENSION } = require('../helper/constant.helper');

/**
 * File upload middleware.
 */
const fileUpload = multer({
    storage: multer.memoryStorage(),
});

/**
 * File size & extension validation.
 * @param {Object} validation
 * @param {Object} file
 * @param {Object} res
 * @returns
 */
const fileSizeAndExtValidation = (validation, file) => {
    if (validation?.size && file.size > validation.size) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            `${file.originalname} size limit exceeded. Max size: ${validation.size} bytes.`
        );
    }

    if (validation?.ext && !validation.ext.includes(file.originalname.split('.').pop())) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            `${file.originalname} file type not allowed. Allowed extensions: ${validation.ext.join(
                ', '
            )}.`
        );
    }
};

/**
 * File validation.
 * @param {String} method
 * @param {String | Array} validation
 * @returns
 */
const fileValidation = (method, validation) => (req, res, next) => {
    try {
        let files;
        switch (method) {
            case 'single':
                const file = req.file;

                if (validation.required && !file) {
                    throw new ApiError(
                        httpStatus.BAD_REQUEST,
                        !validation?.message ? `Please upload 1 file.` : validation?.message
                    );
                }

                if (file) {
                    fileSizeAndExtValidation(validation, file, res);
                }
                break;

            case 'array':
                files = req?.files;

                if (validation.required && (!files || !files?.length)) {
                    throw new ApiError(
                        httpStatus.BAD_REQUEST,
                        !validation?.message ? `Please upload minimum 1 file.` : validation?.message
                    );
                }

                if (
                    (validation.required && validation.limit && !files.length) ||
                    (validation.limit && files?.length > validation.limit)
                ) {
                    throw new ApiError(
                        httpStatus.BAD_REQUEST,
                        `You can upload a maximum of ${validation.limit} files`
                    );
                }

                if (files?.length) {
                    for (let i = 0; i < files.length; i++) {
                        fileSizeAndExtValidation(validation, files[i], res);
                    }
                }
                break;

            case 'fields':
                files = req.files;

                const errMsg = [];
                validation.forEach((ele) => {
                    if (ele.required) {
                        if (!(ele.name in files)) {
                            errMsg.push(!validation?.message ? ele.name : validation?.message);
                        }
                    }
                });

                if (errMsg.length) {
                    throw new ApiError(httpStatus.BAD_REQUEST, `${errMsg.join(', ')} required.`);
                }

                if (files && Object.values(files).length) {
                    for (let ele in files) {
                        const fileValidation = validation.find((e) => e.name === ele);

                        if (fileValidation?.limit && files[ele].length > fileValidation.limit) {
                            throw new ApiError(
                                httpStatus.BAD_REQUEST,
                                `You can upload a maximum of ${fileValidation.limit} ${ele} files`
                            );
                        }

                        for (let i = 0; i < files[ele].length; i++) {
                            fileSizeAndExtValidation(fileValidation, files[ele][i], res);
                        }
                    }
                }
                break;

            default:
                throw new ApiError(httpStatus.BAD_REQUEST, 'Method invalid');
        }

        next(); // Validation passed, move on to the next middleware.
    } catch (error) {
        throw new ApiError(error.statusCode || httpStatus.BAD_REQUEST, error.message);
    }
};

module.exports = { fileUpload, fileValidation };

/** fileUpload middleWare example */

/**
 * For Single file
 * fileUpload.single('userImage'),
 * fileValidation('single', { size: 1000000, ext: ['jpg', 'jpeg', 'png', 'tiff', 'heic'] }),
 */

/**
 * For Array files
 * fileUpload.array('userImage'),
 * fileUpload('array', 'userImage', { limit: 2, size: 1000000, ext: ['jpg', 'jpeg', 'png'] }),
 */

/**
 * For Multiple field files
 * fileUpload.fields([{ name: 'restaurant_logo' }, { name: 'favicon_logo' }])
 * fileUpload('fields', [
 *   { name: 'restaurant_logo', limit: 2, size: 1000000, ext: ['jpg', 'jpeg'] },
 *   { name: 'favicon_logo', limit: 2, size: 1000000, ext: ['png'] },
 * ]);
 */
