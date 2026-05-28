const registerForm =
document.getElementById("registerForm");

registerForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const studentData = {

            fullName:
            document.getElementById(
                "fullName"
            ).value,

            email:
            document.getElementById(
                "email"
            ).value,

            password:
            document.getElementById(
                "password"
            ).value,

            githubUsername:
            document.getElementById(
                "githubUsername"
            ).value,

            repositoryName:
            document.getElementById(
                "repositoryName"
            ).value,

            profileImage:
            document.getElementById(
                "profileImage"
            ).value

        };

        try {

            const response = await fetch(

                "http://localhost:5000/api/auth/register",

                {

                    method:"POST",

                    headers:{
                        "Content-Type":"application/json"
                    },

                    body:JSON.stringify(
                        studentData
                    )

                }

            );

            const result =
            await response.json();

            if(response.status === 201){

                alert(
                    "Registration Successful"
                );

                localStorage.removeItem(
                    "student"
                );

                window.location.href =
                "index.html";

            } else {

                alert(

                    result.message ||

                    "Registration Failed"

                );

            }

        } catch(error){

            console.log(error);

            alert(
                "Registration Failed"
            );

        }

    }
);