(async () => {
  const { $, pageYear, getSession } = window.opsUtil;
  pageYear();

  const authStatus = $("authStatus");
  const btnSignOut = $("btnSignOut");

  const session = await getSession();
  const onLoginPage = window.location.pathname.endsWith("/login.html");

  if (!session && !onLoginPage) {
    window.location.href = "./login.html";
    return;
  }

  if (session && onLoginPage) {
    window.location.href = "./p.html";
    return;
  }

  if (authStatus) {
    authStatus.textContent = session ? `Signed in as ${session.user.email}` : "Not signed in";
  }

  if (btnSignOut) {
    btnSignOut.addEventListener("click", async () => {
      await window.opsUtil.signOut();
      window.location.href = "./login.html";
    });
  }
})();