export const getUser = () => {
  try {
    const user = localStorage.getItem("user");

    if (!user) return null;

    return JSON.parse(user);
  } catch (err) {
    console.log("Invalid user data");

    localStorage.removeItem("user");

    return null;
  }
};