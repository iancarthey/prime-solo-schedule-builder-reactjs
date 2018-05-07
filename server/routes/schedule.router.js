const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();

/**
 * GET route template
 */
router.get('/', (req, res) => {
    
});

/**
 * POST route template
 */
router.post('/', (req, res) => {
    console.log(req.body);
    const schedule = req.body;

    (async () => {
        const client = await pool.connect();
        try{
            await client.query('BEGIN');
            //creates new schedule that can be referenced in later query
            let queryText = `INSERT INTO schedule (name, date, schedule_group_id) VALUES ($1, $2, $3) 
                             RETURNING "id";`;
            //values to be inserted in query
            values = [schedule.newScheduleInfo.newSchedule.name, schedule.newScheduleInfo.newSchedule.date, schedule.newScheduleInfo.newSchedule.group];

            const scheduleResult = await client.query(queryText, values);
            //id of the newly inserted schedule
            const scheduleId = scheduleResult.rows[0].id;

            //For loop to go through each schedule item
            for(let scheduleItem of schedule.newScheduleItems){
                //query for each item
                console.log(scheduleItem);
                queryText = `INSERT INTO schedule_item (name, type, github, description, schedule_id) 
                            VALUES ($1, $2, $3, $4, $5);`;
                //values for each item
                values = [scheduleItem.name, scheduleItem.type, scheduleItem.url, scheduleItem.description, scheduleId];
                const result = await client.query(queryText, values); 
            }
            await client.query('COMMIT');
            res.sendStatus(201);
        } catch (e) {
            console.log('ROLLBACK', e);
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

    })().catch( (error) => {
        console.log('ERROR IN ASYNC POST: ', error);
        res.sendStatus(500);
    });
});

module.exports = router;