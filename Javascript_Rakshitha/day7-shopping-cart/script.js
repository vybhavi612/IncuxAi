const products = [

{
    id: 1,
    name: "Laptop",
    price: 50000
},
{
    id: 2,
    name: "Mouse",
    price: 500
},
{
    id: 3,
    name: "Keyboard",
    price: 1500
}

];

let cart = [];
let total = 0;

function loadProducts() {

    const container =
    document.getElementById("products");

    products.forEach(product => {

        const div =
        document.createElement("div");

        div.innerHTML = `
            <h3>${product.name}</h3>
            <p>₹${product.price}</p>
            <button type="button" onclick="addToCart(${product.id})">
                Add To Cart
            </button>
        `;

        container.appendChild(div);
    });
}

function addToCart(id) {

    const product =
    products.find(p => p.id === id);

    cart.push(product);

    total += product.price;

    renderCart();
}

function renderCart() {

    const cartList =
    document.getElementById("cart");

    cartList.innerHTML = "";

    cart.forEach(item => {

        const li =
        document.createElement("li");

        li.textContent =
        `${item.name} - ₹${item.price}`;

        cartList.appendChild(li);
    });

    document.getElementById("cartTotal")
    .textContent = total;
}

loadProducts();

