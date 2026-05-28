const adminLoginForm =
document.getElementById(
    "adminLoginForm"
);

adminLoginForm.addEventListener(
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

            const response =
            await fetch(

                "http://localhost:5000/api/auth/admin-login",

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

                    "admin",

                    JSON.stringify(result)

                );

                alert(
                    "Admin Login Success"
                );

                window.location.href =
                "admin.html";

            } else {

                alert(
                    result.message
                );

            }

        } catch(error){

            console.log(error);

        }

    }
);