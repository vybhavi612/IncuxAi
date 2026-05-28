const student =
JSON.parse(
    localStorage.getItem("student")
);

if (!student) {

    window.location.href =
    "index.html";

}

document.getElementById(
    "studentName"
).innerText =
student.fullName || "No Name";

document.getElementById(
    "studentEmail"
).innerText =
student.email || "No Email";

document.getElementById(
    "profileImage"
).src =

student.profileImage ||

"https://cdn-icons-png.flaticon.com/512/149/149071.png";

document.getElementById(
    "repoName"
).innerText =
student.repositoryName || "No Repository";

document.getElementById(
    "githubUsername"
).innerText =
student.githubUsername || "No Username";

async function loadAttendanceDetails(){

    try {

        const response =
        await fetch(

            `http://localhost:5000/api/attendance/today/${student.id}`

        );

        const result =
        await response.json();

        if(result.found){

            const data =
            result.attendanceData;

            document.getElementById(
                "attendanceStatus"
            ).innerText =
            data.status;

            document.getElementById(
                "loginTime"
            ).innerText =
            data.loginTime;

            document.getElementById(
                "delayTime"
            ).innerText =

            data.delayMinutes +

            " Minutes";

        } else {

            document.getElementById(
                "attendanceStatus"
            ).innerText =
            "Not Marked";

            document.getElementById(
                "loginTime"
            ).innerText =
            "--";

            document.getElementById(
                "delayTime"
            ).innerText =
            "--";

        }

    } catch(error){

        console.log(error);

    }

}

async function loadGitHubData(){

    try {

        const response = await fetch(

            `http://localhost:5000/api/github/${student.githubUsername}/${student.repositoryName}`

        );

        const repo =
        await response.json();

        document.getElementById(
            "repoStars"
        ).innerText =
        repo.stars || 0;

        document.getElementById(
            "repoForks"
        ).innerText =
        repo.forks || 0;

        document.getElementById(
            "lastPush"
        ).innerText =

        repo.lastPush

        ?

        new Date(
            repo.lastPush
        ).toLocaleString()

        :

        "No Activity";

        document.getElementById(
            "repoVisibility"
        ).innerText =
        repo.visibility || "Public";

    } catch(error){

        console.log(error);

    }

}

loadAttendanceDetails();

loadGitHubData();

document.getElementById(
    "logoutBtn"
).addEventListener(
    "click",
    async () => {

        try {

            const response =
            await fetch(

                "http://localhost:5000/api/attendance/logout",

                {

                    method:"POST",

                    headers:{
                        "Content-Type":"application/json"
                    },

                    body:JSON.stringify({

                        studentId:
                        student.id

                    })

                }

            );

            const result =
            await response.json();

            if(result.totalMinutes !== undefined){

                alert(

                    "Session Duration: "

                    +

                    result.totalMinutes

                    +

                    " minutes"

                );

            } else {

                alert(
                    result.message
                );

            }

            localStorage.removeItem(
                "student"
            );

            window.location.href =
            "index.html";

        } catch(error){

            console.log(error);

            alert(
                "Logout Failed"
            );

        }

    }
);