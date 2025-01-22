const fs = require('fs');
const { FILES_FOLDER } = require('../helper/constant.helper');
const httpStatus = require('http-status');
const path = require('path');
const ApiError = require('../utils/apiError');
const sharp = require('sharp');
const { generateMessage } = require('../helper/function.helper');

/**
 * Create folder.
 * @param {Object} [folder] - File payload.
 * @param {string} [folder.folderName] - File's folder name.
 * @param {string} [folder.innerFolderName] - File's inner folder name.
 * @returns {Promise<String>} - Folder path.
 */
const createFolder = (folder) => {
    const publicDir = `./${FILES_FOLDER.public}`;
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir); // If public folder doesn't exist, create it.
    }

    let folderPath = path.join(publicDir, folder.folderName); // Add folder name in write file path.

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath); // If write file path doesn't exist, create it.
    }

    if (folder.innerFolderName) {
        folderPath = path.join(folderPath, folder.innerFolderName); // Add folder name(innerFolderName) in write file path.

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath); // If write file path doesn't exist, create it.
        }
    }

    return folderPath;
};

/**
 * File compress.
 * @param {String} fromFile
 * @param {String} toFile
 * @param {String} ext
 * @param {Number} quality
 * @returns
 */
const sharpCompress = async (fromFile, toFile, ext, quality) => {
    const compress = await sharp(fromFile)
        .toFormat(ext, { quality })
        .toFile(toFile)
        .then((data) => data)
        .catch(() => false);

    return !compress ? false : toFile.split('/').at(-1); // Create file name.
};

/**
 * File Resize.
 * @param {String} fromFile
 * @param {String} toFile
 * @param {Array} size
 * @returns
 */
const sharpResize = (fromFile, toFile, size) => {
    const resize = sharp(fromFile)
        .resize(...size)
        .toFile(toFile);

    return !resize ? false : toFile.split('/').at(-1); // Create file name.
};

/**
 * Save file.
 * @param {Object} [filePayload] - File payload.
 * @param {string} [filePayload.folderName] - File's folder name.
 * @param {string} [filePayload.innerFolderName] - File's inner folder name.
 * @param {Object} [filePayload.file] - File data.
 * @param {Object} [filePayload.file.originalname] - File original name.
 * @param {Object} [filePayload.file.buffer] - File buffer.
 * @returns {Promise<QueryResult>}
 */
exports.saveFile = (filePayload) => {
    try {
        let writeFilePath = createFolder({
            folderName: filePayload.folderName,
            innerFolderName: filePayload.innerFolderName,
        });

        const writeFile = (file) => {
            const fileName = 'org_' + Date.now() + path.extname(file.originalname); // Create file name.

            let filePath = path.join(writeFilePath, fileName);

            fs.writeFileSync(`./${filePath}`, file.buffer, 'base64'); // Create file.

            return { name: fileName, path: filePath };
        };

        if (Array.isArray(filePayload.file)) {
            const fileData = [];

            for (let i = 0; i < filePayload.file.length; i++) {
                fileData.push(writeFile(filePayload.file[i]));
            }

            return { name: fileData.map((ele) => ele.name), path: fileData.map((ele) => ele.path) };
        } else {
            return writeFile(filePayload.file);
        }
    } catch (error) {
        throw new ApiError(httpStatus.BAD_REQUEST, generateMessage('something_went_wrong'));
    }
};

/**
 * Compress file using path.
 * @param {String} fromFile - From file path
 * @param {Object} fileQuality
 * @param {String} [fileQuality.type] - File quality type large/small
 * @param {Number} [fileQuality.quality] - File quality
 * @returns
 */
exports.compressFileUsingPath = async (fromFile, fileQuality) => {
    try {
        const fileCompress = async (fromFile) => {
            let toFile = fromFile.replace('org', fileQuality.type); // Create file name.

            return sharpCompress(
                fromFile,
                toFile,
                path.extname(toFile).slice(1),
                fileQuality.quality
            );
        };

        if (Array.isArray(fromFile)) {
            const files = [];

            for (let i = 0; i < fromFile.length; i++) {
                const isCompress = await fileCompress(fromFile[i]);

                if (!isCompress) return false;

                files.push(isCompress);
            }

            return files;
        } else {
            const isCompress = await fileCompress(fromFile);

            return !isCompress ? false : isCompress;
        }
    } catch (error) {
        throw new ApiError(httpStatus.BAD_REQUEST, generateMessage('something_went_wrong'));
    }
};

/**
 * Compress file using buffer.
 * @param {Object} filePayload
 * @param {String} [filePayload.folderName] - Main folder name
 * @param {string} [filePayload.innerFolderName] - File's inner folder name.
 * @param {Object} [filePayload.file] - Req file object
 * @param {Object} fileQuality -
 * @param {String} [fileQuality.type] - Quality type large/small
 * @param {Number} [fileQuality.quality] - File quality
 * @returns
 */
exports.compressFileUsingBuffer = async (filePayload, fileQuality) => {
    try {
        let writeFilePath = createFolder({
            folderName: filePayload.folderName,
            innerFolderName: filePayload.innerFolderName,
        });

        const fileCompress = async (fromFile) => {
            let ext = fromFile.originalname.split('.').at(-1);

            return sharpCompress(
                fromFile.buffer,
                `./${writeFilePath}/${fileQuality.type}_${Date.now()}.${ext}`,
                ext,
                fileQuality.quality
            );
        };

        if (Array.isArray(filePayload.file)) {
            const files = [];

            for (let i = 0; i < filePayload.file.length; i++) {
                const isCompress = await fileCompress(filePayload.file[i]);

                if (!isCompress) return false;

                files.push(isCompress);
            }

            return files;
        } else {
            const isCompress = await fileCompress(filePayload.file);

            return !isCompress ? false : isCompress;
        }
    } catch (error) {
        throw new ApiError(httpStatus.BAD_REQUEST, generateMessage('something_went_wrong'));
    }
};

/**
 * Resize file using path.
 * @param {String} fromFile - From file path
 * @param {Object} fileSize
 * @param {String} [fileSize.type] - File quality type large/small
 * @param {Number} [fileSize.size] - File size
 * @returns
 */
exports.resizeFileUsingPath = async (fromFile, fileSize) => {
    try {
        const fileResize = async (fromFile) => {
            let toFile = fromFile.replace('org', fileSize.type); // Create file name.

            return sharpResize(fromFile, toFile, fileSize.size);
        };

        if (Array.isArray(fromFile)) {
            const files = [];

            for (let i = 0; i < fromFile.length; i++) {
                const isCompress = await fileResize(fromFile[i]);

                if (!isCompress) return false;

                files.push(isCompress);
            }

            return files;
        } else {
            const isCompress = await fileResize(fromFile);

            return !isCompress ? false : isCompress;
        }
    } catch (error) {
        throw new ApiError(httpStatus.BAD_REQUEST, generateMessage('something_went_wrong'));
    }
};

/**
 * Compress file using buffer.
 * @param {Object} filePayload
 * @param {String} [filePayload.folderName] - Main folder name
 * @param {string} [filePayload.innerFolderName] - File's inner folder name.
 * @param {Object} [filePayload.file] - Req file object
 * @param {Object} fileSize -
 * @param {String} [fileSize.type] - File size type large/small
 * @param {Number} [fileSize.size] - File size
 * @returns
 */
exports.resizeFileUsingBuffer = async (filePayload, fileSize) => {
    try {
        let writeFilePath = createFolder({
            folderName: filePayload.folderName,
            innerFolderName: filePayload.innerFolderName,
        });

        const fileResize = async (fromFile) => {
            let ext = fromFile.originalname.split('.').at(-1);

            return sharpResize(
                fromFile.buffer,
                `./${writeFilePath}/${fileSize.type}_${Date.now()}.${ext}`,
                fileSize.size
            );
        };

        if (Array.isArray(filePayload.file)) {
            const files = [];

            for (let i = 0; i < filePayload.file.length; i++) {
                const isResize = await fileResize(filePayload.file[i]);

                if (!isResize) return false;

                files.push(isResize);
            }

            return files;
        } else {
            const isResize = await fileResize(filePayload.file);

            return !isResize ? false : isResize;
        }
    } catch (error) {
        throw new ApiError(httpStatus.BAD_REQUEST, generateMessage('something_went_wrong'));
    }
};

/**
 * Delete file.
 * @param {String} filePath - File path.
 */
exports.deleteFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

/**
 * Delete files.
 * @param {Array} filePath - Array of file path.
 */
exports.deleteFiles = (filePath) => {
    for (let i = 0; i < filePath.length; i++) {
        if (fs.existsSync(filePath[i])) {
            fs.unlinkSync(filePath[i]);
        }
    }
};
