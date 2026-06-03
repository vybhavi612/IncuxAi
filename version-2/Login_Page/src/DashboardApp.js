const hDash = React.createElement;

function formatDate(value) {
  if (!value) {
    return "--";
  }

  return new Date(value).toLocaleString();
}

function DashboardApp() {
  const [currentUser] = React.useState(window.dataService.getCurrentUser());
  const [settings, setSettings] = React.useState(window.dataService.getSettings());
  const [records, setRecords] = React.useState(window.dataService.getAttendanceRecords());
  const [users] = React.useState(window.dataService.getUsers());
  const [remoteUsers, setRemoteUsers] = React.useState(users);

  React.useEffect(() => {
    if (!currentUser) {
      window.location.href = "./login.html";
    }
  }, [currentUser]);

  React.useEffect(() => {
    async function loadDashboardData() {
      const [nextSettings, nextRecords, nextUsers] = await Promise.all([
        window.dataService.getSettingsAsync(),
        window.dataService.getAttendanceRecordsAsync(),
        window.dataService.getUsersAsync(),
      ]);

      setSettings(nextSettings);
      setRecords(nextRecords);
      setRemoteUsers(nextUsers);
    }

    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser]);

  if (!currentUser) {
    return hDash("main", { className: "dashboard-page" }, "Redirecting...");
  }

  const isAdmin = currentUser.role === "admin";
  const visibleRecords = isAdmin ? records : window.dataService.recordsForUser(currentUser.id);

  function handleSettingsChange(event) {
    const nextSettings = { ...settings, [event.target.name]: event.target.value };
    setSettings(window.dataService.saveSettings(nextSettings));
  }

  function handleLogout() {
    window.authService.logout();
    window.location.href = "./login.html";
  }

  function markLogout() {
    const nextRecords = window.dataService.logoutAttendance(currentUser.id);
    setRecords(nextRecords);
  }

  return hDash(
    "main",
    { className: "dashboard-page" },
    hDash(
      "header",
      { className: "dashboard-header" },
      hDash(
        "a",
        { className: "brand dashboard-brand", href: "../Main_Page/index.html" },
        hDash("span", { className: "brand-mark" }, "AT"),
        hDash("span", null, "Attendance Tracker")
      ),
      hDash(
        "div",
        { className: "header-actions" },
        hDash("span", { className: "role-pill" }, currentUser.role),
        hDash("button", { className: "ghost-button", onClick: markLogout }, "Mark logout"),
        hDash("button", { className: "ghost-button", onClick: handleLogout }, "Sign out")
      )
    ),
    hDash(
      "section",
      { className: "dashboard-grid" },
      hDash(
        "article",
        { className: "panel" },
        hDash("p", { className: "eyebrow" }, isAdmin ? "Admin" : "My profile"),
        hDash("h1", null, isAdmin ? "All attendance details" : currentUser.name),
        hDash("p", null, `${currentUser.email} • ${currentUser.department}`)
      ),
      hDash(
        "article",
        { className: "panel compact-panel" },
        hDash("p", { className: "eyebrow" }, "Office time"),
        hDash("strong", null, `${settings.loginTime} - ${settings.logoutTime}`)
      )
    ),
    isAdmin
      ? hDash(
          "section",
          { className: "panel settings-panel" },
          hDash("h2", null, "Set login and logout time"),
          hDash(
            "div",
            { className: "time-controls" },
            hDash("label", null, "Login time", hDash("input", {
              type: "time",
              name: "loginTime",
              value: settings.loginTime,
              onChange: handleSettingsChange,
            })),
            hDash("label", null, "Logout time", hDash("input", {
              type: "time",
              name: "logoutTime",
              value: settings.logoutTime,
              onChange: handleSettingsChange,
            }))
          ),
          hDash("p", null, "Demo admin: admin@attendance.local / Admin@123")
        )
      : null,
    isAdmin
      ? hDash(
          "section",
          { className: "panel" },
          hDash("h2", null, "Employees and students"),
          hDash(
            "div",
            { className: "people-grid" },
            remoteUsers.map((user) =>
              hDash(
                "div",
                { className: "person-card", key: user.id },
                hDash("strong", null, user.name),
                hDash("span", null, user.email),
                hDash("span", null, `${user.role} • ${user.department}`)
              )
            )
          )
        )
      : null,
    hDash(
      "section",
      { className: "panel" },
      hDash("h2", null, isAdmin ? "Login and logout records" : "My attendance records"),
      hDash(
        "div",
        { className: "table-wrap" },
        hDash(
          "table",
          null,
          hDash(
            "thead",
            null,
            hDash(
              "tr",
              null,
              hDash("th", null, "Photo"),
              hDash("th", null, "Name"),
              hDash("th", null, "Role"),
              hDash("th", null, "Login time"),
              hDash("th", null, "Logout time")
            )
          ),
          hDash(
            "tbody",
            null,
            visibleRecords.map((record) =>
              hDash(
                "tr",
                { key: record.id },
                hDash(
                  "td",
                  null,
                  record.photoDataUrl
                    ? hDash("img", { className: "record-photo", src: record.photoDataUrl, alt: record.userName })
                    : "--"
                ),
                hDash("td", null, record.userName),
                hDash("td", null, record.role),
                hDash("td", null, formatDate(record.loginAt)),
                hDash("td", null, formatDate(record.logoutAt))
              )
            )
          )
        )
      )
    )
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(hDash(DashboardApp));
