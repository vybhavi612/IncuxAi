const loginForm =
document.getElementById("loginForm");

loginForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const email =
        document.getElementById(
            "email"
        ).value;

        const password =
        document.getElementById(
            "password"
        ).value;

        try {

            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {

                    method:"POST",

                    headers:{
                        "Content-Type":"application/json"
                    },

                    body:JSON.stringify({

                        email,
                        password

                    })

                }
            );

            const result =
            await response.json();

            if(response.status === 200){

                localStorage.setItem(
                    "student",
                    JSON.stringify(result)
                );

                await markAttendance(
                    result
                );

                window.location.href =
                "dashboard.html";

            } else {

                alert(
                    result.message
                );

            }

        } catch(error){

            console.log(error);

            alert(
                "Login Failed"
            );

        }

    }
);

async function markAttendance(student){

    try {

        const response = await fetch(
            "http://localhost:5000/api/attendance/mark",
            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    studentId:
                    student.id,

                    fullName:
                    student.fullName

                })

            }
        );

        const result =
        await response.json();

        console.log(result);

        if(response.status === 201){

            console.log(
                "Attendance Marked"
            );

        }

        if(response.status === 400){

            console.log(
                result.message
            );

        }

    } catch(error){

        console.log(error);

    }

}