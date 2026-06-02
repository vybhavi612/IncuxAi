const express = require("express");

const router = express.Router();

const Task = require("../models/Task");

router.post("/add-task", async (req,res)=>{

    try
    {

        const task = new Task(req.body);

        await task.save();

        res.json({

            success : true,

            message : "Task Added"

        });

    }

    catch(err)
    {

        console.log(err);

        res.status(500).json({

            success : false,

            message : "Task Error"

        });

    }

});

router.get("/tasks/:email", async (req,res)=>{

    try
    {

        const tasks = await Task.find({

            userEmail : req.params.email

        }).sort({ _id : -1 });

        res.json(tasks);

    }

    catch(err)
    {

        console.log(err);

        res.status(500).json({

            success : false,

            message : "Error Fetching Tasks"

        });

    }

});

module.exports = router;