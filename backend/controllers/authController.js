const db =
require("../firebase/firebaseConfig");

const registerStudent = async (req, res) => {

    try {

        const {

            fullName,
            email,
            password,
            githubUsername,
            repositoryName,
            profileImage

        } = req.body;

        const studentData = {

            fullName,
            email,
            password,
            githubUsername,
            repositoryName,

            profileImage:
            profileImage || "",

            role:"student",

            createdAt:
            new Date()

        };

        await db
        .collection("students")
        .add(studentData);

        res.status(201).json({

            message:
            "Student Registered Successfully"

        });

    } catch(error){

        res.status(500).json({

            error:error.message

        });

    }

};

const loginStudent = async (req, res) => {

    try {

        const {

            email,
            password

        } = req.body;

        const snapshot =
        await db
        .collection("students")
        .where("email","==",email)
        .where("password","==",password)
        .get();

        if(snapshot.empty){

            return res.status(401).json({

                message:
                "Invalid Credentials"

            });

        }

        let studentData;

        snapshot.forEach(doc => {

            studentData = {

                id:doc.id,

                ...doc.data()

            };

        });

        res.status(200).json(
            studentData
        );

    } catch(error){

        res.status(500).json({

            error:error.message

        });

    }

};

const adminLogin = async (req, res) => {

    try {

        const {

            email,
            password

        } = req.body;

        const snapshot =
        await db
        .collection("admins")
        .where("email","==",email)
        .where("password","==",password)
        .get();

        if(snapshot.empty){

            return res.status(401).json({

                message:
                "Invalid Admin Credentials"

            });

        }

        let adminData;

        snapshot.forEach(doc => {

            adminData = {

                id:doc.id,

                ...doc.data()

            };

        });

        res.status(200).json(
            adminData
        );

    } catch(error){

        res.status(500).json({

            error:error.message

        });

    }

};

module.exports = {

    registerStudent,

    loginStudent,

    adminLogin

};