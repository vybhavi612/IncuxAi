function saveNote() {
  const note = document.getElementById("note").value;

  let notes = JSON.parse(localStorage.getItem("notes")) || [];

  notes.push(note);

  localStorage.setItem("notes", JSON.stringify(notes));

  loadNotes();
  document.getElementById("note").value = "";
}

function loadNotes() {
  const notes = JSON.parse(localStorage.getItem("notes")) || [];

  const container = document.getElementById("notes");
  container.innerHTML = "";

  notes.forEach((note) => {
    const p = document.createElement("p");
    p.textContent = note;
    container.appendChild(p);
  });
}

loadNotes();

