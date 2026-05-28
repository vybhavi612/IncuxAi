const db = require("../firebase/firebaseConfig");

const markAttendance = async (req, res) => {

    try {

        const {
            studentId,
            fullName
        } = req.body;

        const loginTime =
        new Date();

        const today =
        loginTime.toLocaleDateString();

        const snapshot =
        await db
        .collection("attendance")
        .where(
            "studentId",
            "==",
            studentId
        )
        .where(
            "loginDate",
            "==",
            today
        )
        .get();

        if(!snapshot.empty){

            const doc =
            snapshot.docs[0];

            const existingData =
            doc.data();

            const updatedHistory = [

                ...(existingData.loginHistory || []),

                loginTime.toLocaleTimeString()

            ];

            await db
            .collection("attendance")
            .doc(doc.id)
            .update({

                lastLoginTime:
                loginTime.toLocaleTimeString(),

                loginCount:
                (existingData.loginCount || 1) + 1,

                loginHistory:
                updatedHistory

            });

            return res.status(200).json({

                alreadyMarked: true,

                message:
                "Attendance Already Marked",

                attendanceData: {

                    ...existingData,

                    lastLoginTime:
                    loginTime.toLocaleTimeString(),

                    loginCount:
                    (existingData.loginCount || 1) + 1,

                    loginHistory:
                    updatedHistory

                }

            });

        }

        const reportingHour = 10;

        let attendanceStatus =
        "On Time";

        let delayMinutes = 0;

        if(
            loginTime.getHours()
            >= reportingHour
        ){

            delayMinutes =

            (
                loginTime.getHours()
                - reportingHour
            ) * 60

            +

            loginTime.getMinutes();

            if(delayMinutes > 0){

                attendanceStatus =
                "Late";

            }

        }

        const attendanceData = {

            studentId,

            fullName,

            loginDate:
            today,

            loginTime:
            loginTime.toLocaleTimeString(),

            lastLoginTime:
            loginTime.toLocaleTimeString(),

            loginCount: 1,

            loginHistory: [

                loginTime.toLocaleTimeString()

            ],

            status:
            attendanceStatus,

            delayMinutes,

            createdAt:
            new Date()

        };

        await db
        .collection("attendance")
        .add(attendanceData);

        res.status(201).json({

            alreadyMarked: false,

            message:
            "Attendance Marked",

            attendanceData

        });

    } catch(error){

        console.log(error);

        res.status(500).json({

            error:
            error.message

        });

    }

};

const getTodayAttendance =
async (req, res) => {

    try {

        const { studentId } =
        req.params;

        const today =
        new Date()
        .toLocaleDateString();

        const snapshot =
        await db
        .collection("attendance")
        .where(
            "studentId",
            "==",
            studentId
        )
        .where(
            "loginDate",
            "==",
            today
        )
        .get();

        if(snapshot.empty){

            return res.status(404).json({

                found:false,

                message:
                "No Attendance Found"

            });

        }

        let attendanceData;

        snapshot.forEach(doc => {

            attendanceData =
            doc.data();

        });

        res.status(200).json({

            found:true,

            attendanceData

        });

    } catch(error){

        console.log(error);

        res.status(500).json({

            error:
            error.message

        });

    }

};

const logoutAttendance =
async (req, res) => {

    try {

        const { studentId } =
        req.body;

        const today =
        new Date()
        .toLocaleDateString();

        const snapshot =
        await db
        .collection("attendance")
        .where(
            "studentId",
            "==",
            studentId
        )
        .where(
            "loginDate",
            "==",
            today
        )
        .get();

        if(snapshot.empty){

            return res.status(404).json({

                message:
                "Attendance Not Found"

            });

        }

        const doc =
        snapshot.docs[0];

        const attendanceData =
        doc.data();

        const logoutTime =
        new Date();

        const loginDateTime =
        attendanceData.createdAt.toDate();

        const totalMilliseconds =

        logoutTime - loginDateTime;

        const totalMinutes =

        Math.floor(
            totalMilliseconds / 60000
        );

        await db
        .collection("attendance")
        .doc(doc.id)
        .update({

            logoutTime:
            logoutTime.toLocaleTimeString(),

            totalSessionMinutes:
            totalMinutes,

            workStatus:

            logoutTime.getHours() >= 18

            ?

            "Completed"

            :

            "Left Early"

        });

        res.status(200).json({

            message:
            "Logout Updated",

            totalMinutes

        });

    } catch(error){

        console.log(error);

        res.status(500).json({

            error:
            error.message

        });

    }

};

module.exports = {

    markAttendance,

    getTodayAttendance,

    logoutAttendance

};