const loginStudent = async (req, res) => {

    try {

        const { email, password } = req.body;

        const snapshot = await db.collection("students")
            .where("email", "==", email)
            .where("password", "==", password)
            .get();

        if (snapshot.empty) {

            return res.status(401).json({
                message: "Invalid Credentials"
            });

        }

        let studentData;

        snapshot.forEach(doc => {

            studentData = {
                id: doc.id,
                ...doc.data()
            };

        });

        res.status(200).json(studentData);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};