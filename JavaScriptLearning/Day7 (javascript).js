function calculateBill(units) {

    let bill;

    if(units <= 100) {
        bill = units * 5;
    }
    else {
        bill = (100 * 5) + ((units - 100) * 8);
    }

    return bill;
}

let units = 150;

console.log("Units:", units);
console.log("Bill: ₹" + calculateBill(units));