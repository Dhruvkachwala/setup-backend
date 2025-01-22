const Joi = require('joi');
const httpStatus = require('http-status');
const ApiError = require('../utils/apiError');
const { deleteFile } = require('../services/files.service');
const pick = require('../utils/pick');
const { generateMessage } = require('../helper/function.helper');

const i18next = require('i18next');

const validate = (schema) => (req, res, next) => {
    const validSchema = pick(schema, ['params', 'query', 'body']);
    const object = pick(req, Object.keys(validSchema));
    const { value, error } = Joi.compile(validSchema)
        .prefs({ errors: { label: 'key' }, abortEarly: false })
        .validate(object, { labels: true });

    if (error) {
        if (req.file) deleteFile(`./${req.file.path}`);

        if (req.files) {
            for (let key in req.files) {
                for (let ele of req.files[key]) {
                    deleteFile(`./${ele.path}`);
                }
            }
        }

        const errorMessage = error.details.map((ele) => ele.message).join(', ');

        return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
    }
    Object.assign(req, value);
    return next();
};

// const errors = {
//     labels: true,
//     language: i18next.language,
// };
// const validate = (schema) => (req, res, next) => {
//     const validSchema = pick(schema, ['params', 'query', 'body']);
//     const object = pick(req, Object.keys(validSchema));
//     const { value, error } = Joi.compile(validSchema)
//         .prefs({ errors: { label: 'key' }, abortEarly: false })
//         .validate(object, errors);

//     console.log('=::====error====::=', error);
//     if (error) {
//         if (req.file) deleteFile(`./${req.file.path}`);

//         if (req.files) {
//             for (let key in req.files) {
//                 for (let ele of req.files[key]) {
//                     deleteFile(`./${ele.path}`);
//                 }
//             }
//         }

//         console.log('=====error.details=====', error.details);
//         // const errorMessage = error.details
//         //     .map((details) => {
//         //         if (details.type === 'any.required') {
//         //             return translateResponseMessage(
//         //                 req,
//         //                 'required',
//         //                 details.context.label
//         //             );
//         //         } else if (details.type === 'any.only') {
//         //             return translateResponseMessage(req, 'only', {
//         //                 key: details.context.label,
//         //                 validValue: details.context.valids,
//         //             });
//         //         } else if (details.type === 'array.base') {
//         //             return translateResponseMessage(req, 'must_be', {
//         //                 key: details.context.label,
//         //                 dataType: details.type.split('.')[0],
//         //             });
//         //         } else if (details.type === 'object.unknown') {
//         //             return translateResponseMessage(
//         //                 req,
//         //                 'not_allowed',
//         //                 details.context.label
//         //             );
//         //         } else if (details.type === 'custom') {
//         //             return translateResponseMessage(
//         //                 req,
//         //                 'must_valid',
//         //                 details.context.label
//         //             );
//         //         } else if (details.type === 'date.greater') {
//         //             return translateResponseMessage(req, 'must_be_greater', {
//         //                 key: details.context.label,
//         //                 validValue: details.context.limit,
//         //             });
//         //         } else if (details.type === 'string.pattern.base') {
//         //             return translateResponseMessage(
//         //                 req,
//         //                 'not_valid',
//         //                 details.context.label
//         //             );
//         //         }
//         //         // details.message
//         //     })
//         //     .join(', ');
//         console.log('=====error.details=====', error.details);
//         const errorMessage = error.details.map((ele) => {
//             let validation = '',
//                 attribute = '';
//             switch (ele.type) {
//                 case 'any.required':
//                     validation = 'required';
//                     attribute = ele.context.label;
//                     break;
//                 case 'object.unknown':
//                     validation = 'not_allowed';
//                     attribute = ele.context.label;
//                     break;
//                 case 'custom':
//                     if (ele.message.endsWith('must be a valid mongo id')) {
//                         validation = 'valid_mongo_id';
//                     }
//                     attribute = ele.context.label;
//                     break;
//                 default:
//             }

//             return [validation, attribute];
//         });

//         console.log('=====errorMessage=====', errorMessage);

//         return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
//     }
//     Object.assign(req, value);
//     return next();
// };
module.exports = validate;
