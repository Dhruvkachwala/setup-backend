// const { errorColor, successColor } = require('../helper/color.helper');
// const admin = require('firebase-admin');
// const firebaseConfig = require('../config/firebaseNotification.json');

// const firebaseAdmin = admin.initializeApp({
//     credential: admin.credential.cert(firebaseConfig),
// });

// /**
//  * Send notification
//  * @param {string} deviceToken
//  * @param {string} title
//  * @param {string} body
//  * @param {string} type
//  * @param {string | null} typeId
//  */
// exports.sendNotification = async (deviceToken, title, body) => {
//     try {
//         const notification = firebaseAdmin.messaging().sendToDevice(
//             deviceToken,
//             {
//                 notification: {
//                     title: title,
//                     body: body,
//                     sound: 'default',
//                 },
//                 // data: {
//                 //     clickAction: 'NOTIFICATION_CLICK',
//                 //     notification_type: type,
//                 //     type_id: String(typeId), // Type id only allowed string value
//                 // },
//             },
//             {
//                 priority: 'high',
//                 timeToLive: 60 * 60 * 24,
//                 contentAvailable: true,
//             }
//         );
//         console.log(successColor, '::::::::: notification :::::::::', notification);
//     } catch (error) {
//         console.log(errorColor, 'Notification Error: ', error);
//     }
// };
