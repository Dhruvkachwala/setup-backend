const fs = require('fs');

const validationFile = require('../config/validation.json');
const attributesFile = require('../config/attributes.json');

module.exports = {
    /************************************ Generate response/error message function ****************************************************/
    /**
     * Generate response/error message.
     * @param {Object} req
     * @param {String} validation
     * @param {String} attribute
     * @returns
     */
    generateMessage: (validation, attribute) => {
        let message = '';

        if (!validationFile[validation] || !attributesFile[attribute]) {
            /**
             * Data add in missing file.
             * @param {String} filePath
             * @param {String} data
             */
            const appendDataInMissingFile = (filePath, data) => {
                let fileData = { [data]: data };

                if (fs.existsSync(filePath)) {
                    let file = fs.readFileSync(filePath, 'utf8');
                    fileData = { ...JSON.parse(file), ...fileData };
                } // If the file exists, the file data is merged with the new data.

                fs.writeFileSync(filePath, JSON.stringify(fileData)); // Create or append data to a file.
            };

            if (!validationFile[validation]) {
                appendDataInMissingFile('./src/config/validation.missing.json', validation); // If validation doesn't exist in validationFile, validation add in validation.missing.json file.
            }

            if (!attributesFile[attribute]) {
                appendDataInMissingFile('./src/config/attribute.missing.json', attribute);
            } // If attribute doesn't exist in attributesFile, attribute add in attribute.missing.json file.

            message = validation;
        }

        if (validationFile[validation]) {
            message = validationFile[validation].replace(
                '{{attribute}}',
                attributesFile[attribute] ?? attribute
            );
        } // If validation exist in validationFile,replace attribute to validation of attribute.

        return message;
    },
    /*********************************************************************************************************************************/

    /*********************************** Generate response/error message function with localization **********************************/
    /**
     * Generate response/error message with localization.
     * @param {Object} req
     * @param {String} validation
     * @param {String} attribute
     * @returns
     */
    // generateMessage: (reqT, validation, attribute = '') => {
    //     console.log('=====validation====>>=', validation);
    //     console.log('=====attribute====>>=', attribute);
    //     console.log('=====reqT=====', reqT);

    //     if (validation) {
    //         if (typeof attribute === 'string') {
    //             return reqT(`validation:${validation}`, {
    //                 attribute: reqT(attribute),
    //             });
    //         }

    //         if (typeof attribute === 'object') {
    //             for (let [key, value] of Object.entries(attribute)) {
    //                 key = reqT(value);
    //             }

    //             return reqT(`validation:${validation}`, {
    //                 attribute,
    //             });
    //         }
    //     }

    //     console.log('=====attribute=====', attribute);

    //     return reqT(attribute);
    // },
    /*********************************************************************************************************************************/

    /**
     * The search string is converted to a regex string.
     * @param {String} searchStr
     * @returns
     */
    str2regex: (searchStr) => {
        const regexStr = searchStr.split(''); // Search string split (convert in array)

        regexStr.forEach((ele, ind) => {
            if (
                ['.', '+', '*', '?', '^', '$', '(', ')', '[', ']', '{', '}', '|', '\\'].find(
                    (e) => ele === e
                )
            )
                regexStr[ind] = `\\${regexStr[ind]}`;
        });

        return regexStr.join('');
    },

    /**
     * Generate slug.
     * @param {*} str
     * @returns
     */
    generateSlug: (str) => {
        return str
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '');
    },
};
