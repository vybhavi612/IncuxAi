function convertTemp() {

    let temp = parseFloat(document.getElementById("tempInput").value);
    let type = document.getElementById("conversionType").value;
    let result = document.getElementById("result");

    if (isNaN(temp)) {
        result.innerHTML = "Please enter a valid temperature";
        return;
    }

    let converted;

    if (type === "CtoF") {
        converted = (temp * 9/5) + 32;
        result.innerHTML = `${temp} °C = ${converted.toFixed(2)} °F`;
    }
    else {
        converted = (temp - 32) * 5/9;
        result.innerHTML = `${temp} °F = ${converted.toFixed(2)} °C`;
    }
}