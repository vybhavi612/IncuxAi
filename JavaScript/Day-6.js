// Day6.js

const products = [
    { name: "Laptop", price: 50000 },
    { name: "Mobile", price: 20000 },
    { name: "Headphones", price: 3000 },
    { name: "Keyboard", price: 1500 }
];

// map() - Get product names

const productNames = products.map(product => product.name);

console.log(productNames);

// filter() - Expensive products

const expensiveProducts = products.filter(
    product => product.price > 10000
);

console.log(expensiveProducts);

// reduce() - Total price

const totalPrice = products.reduce(
    (sum, product) => sum + product.price,
    0
);

console.log("Total Price:", totalPrice);

// Chaining map and filter

const discountedProducts = products
    .filter(product => product.price > 2000)
    .map(product => ({
        name: product.name,
        price: product.price * 0.9
    }));

console.log(discountedProducts);
