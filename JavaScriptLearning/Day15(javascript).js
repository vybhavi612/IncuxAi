let balance = 5000;
let withdrawAmount = 7000;

try {

    if (withdrawAmount <= 0) {
        throw "Withdrawal amount must be greater than 0.";
    }

    if (withdrawAmount > balance) {
        throw "Insufficient Balance!";
    }

    balance -= withdrawAmount;

    console.log("Withdrawal Successful!");
    console.log("Remaining Balance: ₹" + balance);

} catch (error) {

    console.log("Error:", error);

} finally {

    console.log("Thank you for using our bank.");

}