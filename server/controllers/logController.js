const router = require("express").Router();
const {LogModel} = require("../models");
const {UniqueConstraintError} = require("sequelize/");
const validateSession = require("../middleware/validateSession");

/*
    Create a log entry
*/
router.post("/", validateSession, async (req, res) => {
    const {description, definition, result} = req.body.log;
    const {id} = req.user;
    const logEntry = {
        description,
        definition,
        result,
        owner_id: id
    }

    try {
        const newLog = await LogModel.create(logEntry);
        res.status(200).json(newLog);
    } catch(err) {
        res.status(500).json({error: err});
    }
    res.json(logEntry)
})
/*
    Get All logs for authorized user
*/
router.get("/", validateSession, async (req, res) => {
    let {id} = req.user
    
    try {
        const userLogs = await LogModel.findAll({
            where: {
                owner_id: id
            }
        });
        res.status(200).json(userLogs);
    } catch(err) {
        res.status(500).json({error: err});
    }
})
/*
    Get log by ID
*/
router.get("/:id", validateSession, async (req, res) => {
    const logId = req.params.id;
    const {id} = req.user;
    const query = {
        where: {
            id: logId,
            owner_id: id
        }
    }

    try {
        const result = await LogModel.findOne(query);
        res.status(200).json(result);
    } catch(err) {
        res.status(500).json({error: err});
    }
})
/*
    Update log by ID
*/
router.put("/:id", validateSession, async (req, res) => {
    const logId = req.params.id;
    const {description, definition, result} = req.body.log;
    const {id} = req.user;

    const query = {
        where: {
            id: logId,
            owner_id: id
        }
    };

    const updatedLog = {
        description: description,
        definition: definition,
        result: result
    }
    
    try {
        await LogModel.update(updatedLog, query);
        res.status(200).json({message: "Log entry updated successfully"});
    } catch(err) {
        res.status(500).json({error: err});
    }

})
/*
    Delete log by ID
*/
router.delete("/:id", validateSession, async (req, res) => {
    const logId = req.params.id;
    const {id} = req.user;
    const query = {
        where: {
            id: logId,
            owner_id: id
        }
    }
    try {
        await LogModel.destroy(query);
        res.status(200).json({message: "Log entry removed successfully"});
    } catch(err) {
        res.status(500).json({error: err});
    }
})


module.exports = router;