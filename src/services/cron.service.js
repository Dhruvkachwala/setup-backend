const cron = require('node-cron');

async function cron1() {
    // Cron1 code.
    console.log(':::::::::: Cron1 run successfully ::::::::::');
}

async function cron2() {
    // Cron2 code.
    console.log(':::::::::: Cron2 run successfully ::::::::::');
}

function runCron() {
    // logger.info('-'.repeat(20), '   ', { date: moment().tz('Europe/london') });
    cron.schedule('0 0 0 * * *', cron1, { timezone: 'Asia/Kolkata' });
    cron.schedule('0 0 0 * * *', cron2, { timezone: 'Asia/Kolkata' });
}

/**
 * Cron services are exported from here 👇
 */
module.exports = runCron;
