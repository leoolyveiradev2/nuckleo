// Tela de login/registro
/* pages/auth.js */

const AuthPage = (() => {

  /* ── Tab switching ───────────────────────────────── */
  function initTabs() {
    Helpers.qsa('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        Helpers.qsa('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const target = tab.dataset.tab;

        document.getElementById('login-form').style.display =
          target === 'login' ? 'flex' : 'none';

        document.getElementById('register-form').style.display =
          target === 'register' ? 'flex' : 'none';

        clearErrors();
      });
    });
  }

  function clearErrors() {
    Helpers.qsa('.auth-error').forEach(el => {
      el.textContent = '';
    });
  }

  function setError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
  }

  function setLoading(btn, loading) {
    btn.disabled = loading;
    btn.textContent = loading ? 'Aguarde...' : btn._originalText;
  }

  /* ── Login ───────────────────────────────────────── */
  function initLogin() {
    const btn = document.getElementById('btn-login');
    btn._originalText = btn.textContent;

    btn.addEventListener('click', async () => {
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      if (!email || !password) {
        return setError('auth-error', 'Preencha todos os campos.');
      }

      setLoading(btn, true);

      try {
        const res = await api.auth.login({ email, password });
        App.handleAuthSuccess(res.data);
      } catch (err) {
        setError('auth-error', err.message || 'Email ou senha inválidos.');
      } finally {
        setLoading(btn, false);
      }
    });

    // Enter key
    ['login-email', 'login-password'].forEach(id => {
      document.getElementById(id)?.addEventListener('keydown', e => {
        if (e.key === 'Enter') btn.click();
      });
    });
  }

  /* ── Register ────────────────────────────────────── */
  function initRegister() {
    const btn = document.getElementById('btn-register');
    btn._originalText = btn.textContent;

    btn.addEventListener('click', async () => {
      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;

      if (!name || !email || !password) {
        return setError('reg-error', 'Preencha todos os campos.');
      }

      if (password.length < 8) {
        return setError('reg-error', 'Senha deve ter pelo menos 8 caracteres.');
      }

      setLoading(btn, true);

      try {
        const res = await api.auth.register({ name, email, password });
        App.handleAuthSuccess(res.data);
      } catch (err) {
        setError('reg-error', err.message || 'Erro ao criar conta.');
      } finally {
        setLoading(btn, false);
      }
    });
  }

  /* ── Google OAuth ─────────────────────────────────── */
  function initGoogleOAuth() {
    if (!window.google || !google.accounts || !google.accounts.id) {
      console.error("Google SDK NÃO carregou ❌");
      return;
    }

    google.accounts.id.initialize({
      client_id: "748847692403-qbpqn7lmj1aic4adf0aspvu4ei5puhcc.apps.googleusercontent.com",
      callback: handleCredentialResponse
    });

    console.log("Google SDK carregado com sucesso 🚀");

    const btnLogin = document.getElementById('btn-google-login');
    const btnRegister = document.getElementById('btn-google-register');

    btnLogin?.addEventListener('click', () => {
      google.accounts.id.prompt();
    });

    btnRegister?.addEventListener('click', () => {
      google.accounts.id.prompt();
    });
  }

  /* ── Public API ──────────────────────────────────── */
  return {
    init() {
      initTabs();
      initLogin();
      initRegister();
      initGoogleOAuth();
    },
  };

})();

/* ── Google callback ───────────────────────────────── */
async function handleCredentialResponse(response) {
  try {
    const res = await fetch('https://nuckleo-production.up.railway.app/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential })
    });

    const data = await res.json();

    if (data.success) {
      App.handleAuthSuccess(data.data);
    } else {
      Helpers.toast('Erro no login com Google', 'error');
    }

  } catch (err) {
    console.error(err);
    Helpers.toast('Erro ao conectar com o servidor', 'error');
  }
}
