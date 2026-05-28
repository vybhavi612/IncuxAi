const db = require("../firebase/firebaseConfig");

const getAttendanceRecords = async (req, res) => {

    try {

        const snapshot = await db
            .collection("attendance")
            .orderBy("createdAt", "desc")
            .get();

        const records = [];

        snapshot.forEach(doc => {

            records.push({
                id: doc.id,
                ...doc.data()
            });

        });

        res.status(200).json(records);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

module.exports = {
    getAttendanceRecords
};