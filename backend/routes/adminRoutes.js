const express = require("express");

const router = express.Router();

const User = require("../models/User");
const Task = require("../models/Task");
const History = require("../models/History");

const ADMIN_NAME = "admin";
const ADMIN_PASSWORD = "admin123";

router.post("/admin-login", async (req, res) => {

const { name, password } = req.body;

if(
    name !== ADMIN_NAME ||
    password !== ADMIN_PASSWORD
)
{

    return res.json({

        success : false,

        message : "Invalid Admin Credentials"

    });

}

res.json({

    success : true,

    message : "Admin Login Successful",

    admin : {

        name : ADMIN_NAME

    }

});

});

router.get("/admin-data", async (req, res) => {

try
{

    const users = await User.find();

    let allData = [];

    for(let user of users)
    {

        const tasks = await Task.find({

            userEmail : user.email

        }).sort({ _id : -1 });

        const history = await History.find({

            userEmail : user.email

        }).sort({ login : -1 });

        allData.push({

            ...user._doc,

            tasks,

            history

        });

    }

    res.json(allData);

}

catch(err)
{

    res.json({

        success : false,

        message : "Server Error"

    });

}

});

module.exports = router;