function createTask() {
  const taskInput = document.getElementById("task");
  const task = taskInput.value.trim();
  if (!task) return;

  const card = document.createElement("div");
  card.className = "card";
  card.textContent = task;

  card.draggable = true;
  card.addEventListener("dragstart", drag);

  document.getElementById("todo").appendChild(card);
  taskInput.value = "";
}

function drag(event) {
  event.dataTransfer.setData("text/plain", event.target.textContent);
}

function setupDropZones() {
  const columns = document.querySelectorAll(".column");

  columns.forEach((column) => {
    column.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    column.addEventListener("drop", (e) => {
      e.preventDefault();

      const text = e.dataTransfer.getData("text/plain");
      if (!text) return;

      // Move actual dragged element by searching based on text match.
      // This keeps it simple for a learning project.
      const existing = Array.from(document.querySelectorAll(".card")).find(
        (c) => c.textContent === text
      );

      if (existing) {
        column.appendChild(existing);
      }
    });
  });
}

setupDropZones();

