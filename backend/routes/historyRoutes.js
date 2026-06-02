const express = require("express");

const router = express.Router();

const History = require("../models/History");

router.post("/login-history", async (req,res)=>{

    try
    {

        const history = new History({

            userEmail : req.body.userEmail,

            login : new Date(),

            logout : null

        });

        await history.save();

        res.json({

            success : true,

            message : "Login Saved"

        });

    }

    catch(err)
    {

        console.log(err);

        res.status(500).json({

            success : false

        });

    }

});

router.put("/logout-history/:email", async (req,res)=>{

    try
    {

        const latestHistory = await History.findOne({

            userEmail : req.params.email,

            logout : null

        }).sort({ login : -1 });

        if(latestHistory)
        {

            latestHistory.logout = new Date();

            await latestHistory.save();

        }

        res.json({

            success : true,

            message : "Logout Updated"

        });

    }

    catch(err)
    {

        console.log(err);

        res.status(500).json({

            success : false

        });

    }

});

router.get("/history/:email", async (req,res)=>{

    try
    {

        const history = await History.find({

            userEmail : req.params.email

        }).sort({ login : -1 });

        res.json(history);

    }

    catch(err)
    {

        console.log(err);

        res.status(500).json({

            success : false

        });

    }

});

module.exports = router;