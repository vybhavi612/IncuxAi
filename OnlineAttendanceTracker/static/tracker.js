let lastActivity = Date.now();

document.addEventListener("mousemove", resetActivity);
document.addEventListener("keydown", resetActivity);
document.addEventListener("click", resetActivity);

function resetActivity() {
    lastActivity = Date.now();
}

setInterval(() => {

    let idleSeconds =
        Math.floor((Date.now() - lastActivity) / 1000);

    if(idleSeconds >= 60){

        fetch("/update_idle", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                idle_time: 1
            })
        });

        lastActivity = Date.now();
    }

}, 60000);