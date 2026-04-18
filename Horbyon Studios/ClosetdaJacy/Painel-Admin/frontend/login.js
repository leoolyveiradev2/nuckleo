const API_URL = "http://127.0.0.1:8000";

const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");
const loginBtn = document.getElementById("loginBtn");

const eyeBtn = document.getElementById("eyeBtn");
const passwordField = document.getElementById("passwordField");
const eye = document.querySelector(".eye");

/* ==== OLHO (abre / fecha) ==== */
let open = false;

eyeBtn.addEventListener("click", () => {
  open = !open;

  passwordField.type = open ? "text" : "password";

  eye.classList.toggle("closed", !open);
});

/* =========================
   LOGIN
========================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  errorMsg.classList.remove("visible");

  loginBtn.disabled = true;
  loginBtn.textContent = "Entrando...";

  const formData = new URLSearchParams();
  formData.append("username", form.username.value);
  formData.append("password", form.password.value);

  try {
    const res = await fetch(`${API_URL}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.access_token);
      window.location.href = "./admin.html";
    } else {
      showError();
    }

  } catch (err) {
    alert("Erro: " + err.message);
  }

  loginBtn.disabled = false;
  loginBtn.textContent = "Entrar";
});

/* =========================
   ERRO UI
========================= */
function showError() {
  errorMsg.classList.add("visible");
  form.classList.add("shake");

  setTimeout(() => form.classList.remove("shake"), 400);
}