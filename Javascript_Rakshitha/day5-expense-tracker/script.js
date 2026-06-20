let expenses = [];
let total = 0;

function addExpense() {

    const name =
    document.getElementById("expenseName").value;

    const amount =
    Number(document.getElementById("expenseAmount").value);

    if (!name || !amount) return;

    expenses.push({
        name,
        amount
    });

    total += amount;

    displayExpenses();
}

function displayExpenses() {

    const list =
    document.getElementById("expenseList");

    list.innerHTML = "";

    expenses.forEach(expense => {

        const li =
        document.createElement("li");

        li.textContent =
        `${expense.name} - ₹${expense.amount}`;

        list.appendChild(li);
    });

    document.getElementById("total")
    .textContent = total;
}

