(() => {
  const sb = window.opsSupabase;
  const { $, setMsg, redirectToBase, pageYear } = window.opsUtil;

  pageYear();

  const inSignInEmail = $("inSignInEmail");
  const inSignInPassword = $("inSignInPassword");
  const btnSignIn = $("btnSignIn");
  const signInMsg = $("signInMsg");

  const inSignUpEmail = $("inSignUpEmail");
  const inSignUpPassword = $("inSignUpPassword");
  const btnSignUp = $("btnSignUp");
  const signUpMsg = $("signUpMsg");

  const authStatus = $("authStatus");
  if (authStatus) authStatus.textContent = "Not signed in";

  async function signIn() {
    setMsg(signInMsg, "");
    const email = inSignInEmail.value.trim();
    const password = inSignInPassword.value;

    if (!email || !password) {
      setMsg(signInMsg, "Email + password required.", "err");
      return;
    }

    btnSignIn.disabled = true;
    setMsg(signInMsg, "Signing in…", "");

    const { error } = await sb.auth.signInWithPassword({ email, password });

    btnSignIn.disabled = false;

    if (error) {
      setMsg(signInMsg, error.message, "err");
      return;
    }

    setMsg(signInMsg, "Signed in. Taking you to the feed…", "ok");
    window.location.href = "./p.html";
  }

  async function signUp() {
    setMsg(signUpMsg, "");
    const email = inSignUpEmail.value.trim();
    const password = inSignUpPassword.value;

    if (!email || !password) {
      setMsg(signUpMsg, "Email + password required.", "err");
      return;
    }

    btnSignUp.disabled = true;
    setMsg(signUpMsg, "Creating account…", "");

    const emailRedirectTo = redirectToBase(); // includes repo path on GitHub Pages

    const { error } = await sb.auth.signUp({
      email,
      password,
      options: { emailRedirectTo }
    });

    btnSignUp.disabled = false;

    if (error) {
      setMsg(signUpMsg, error.message, "err");
      return;
    }

    setMsg(signUpMsg, "Account created. Check email if confirmation is enabled.", "ok");
  }

  btnSignIn.addEventListener("click", signIn);
  btnSignUp.addEventListener("click", signUp);
})();