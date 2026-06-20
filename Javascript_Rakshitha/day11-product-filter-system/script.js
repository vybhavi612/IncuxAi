const products = [
  { name: "Laptop", category: "Electronics" },
  { name: "Phone", category: "Electronics" },
  { name: "Shirt", category: "Fashion" },
  { name: "Jeans", category: "Fashion" },
];

function renderProducts(list) {
  const result = document.getElementById("result");
  result.innerHTML = "";

  if (!list.length) {
    result.textContent = "No products found.";
    return;
  }

  list.forEach((product) => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <h4>${product.name}</h4>
      <p>Category: ${product.category}</p>
    `;
    result.appendChild(div);
  });
}

function filterProducts(category) {
  const filtered = products.filter((product) => product.category === category);

  renderProducts(filtered);

  // Advanced example (as in the prompt):
  // const result = products.filter(product =>
  //   product.name.toLowerCase().includes("lap")
  // );
  // console.log(result);
}

// Default render
renderProducts(products);

