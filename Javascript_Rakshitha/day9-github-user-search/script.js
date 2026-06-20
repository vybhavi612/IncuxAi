async function searchUser() {
  const username = document.getElementById("username").value.trim();

  const resultEl = document.getElementById("result");
  resultEl.innerHTML = "";

  if (!username) {
    resultEl.textContent = "Enter a username.";
    return;
  }

  try {
    const response = await fetch(`https://api.github.com/users/${username}`);

    if (!response.ok) {
      resultEl.textContent = "User not found or API rate limit hit.";
      return;
    }

    const user = await response.json();

    resultEl.innerHTML = `
      <img src="${user.avatar_url}" width="100" alt="avatar">
      <h3>${user.name || user.login}</h3>
      <p>Followers: ${user.followers}</p>
      <p>Public Repos: ${user.public_repos}</p>
    `;
  } catch (err) {
    resultEl.textContent = "Something went wrong. Check your internet connection.";
  }
}

