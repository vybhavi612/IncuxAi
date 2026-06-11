let count = 0;

function increase() {
    count++;
    document.getElementById("countLabel").textContent = count;
}

function decrease() {
    count--;
    document.getElementById("countLabel").textContent = count;
}

function reset() {
    count = 0;
    document.getElementById("countLabel").textContent = count;
}