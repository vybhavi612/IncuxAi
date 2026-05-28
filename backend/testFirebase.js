const db = require("./firebase/firebaseConfig");

async function testConnection() {

    try {

        await db.collection("test").add({
            message: "Firebase Connected Successfully"
        });

        console.log("Firebase Connected!");

    } catch (error) {

        console.log(error);

    }

}

testConnection();