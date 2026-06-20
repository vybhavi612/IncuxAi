const searchInput = document.getElementById("search");

searchInput.addEventListener("keyup", () => {
  const searchText = searchInput.value.toLowerCase();
  const items = document.querySelectorAll("#products li");

  items.forEach((item) => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(searchText) ? "block" : "none";
  });
});

