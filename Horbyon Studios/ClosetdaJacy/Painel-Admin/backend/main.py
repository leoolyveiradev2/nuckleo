from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from fastapi import Form

from database import SessionLocal, engine
from models import Base
from schemas import ProdutoCreate, Produto
from auth import (
    create_access_token,
    get_current_user,
    TokenData,
)
from crud import (
    get_produtos,
    get_produto,
    create_produto,
    update_produto,
    delete_produto,
    authenticate_usuario,
)

from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Painel Admin Closet da Jacy")

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],  # em produção, restringir!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- DB INIT ----------------
@app.on_event("startup")
def startup():
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print("Erro ao conectar no banco:", e)

# ---------------- DB SESSION ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------- LOGIN MODEL ----------------
class LoginData(BaseModel):
    username: str
    password: str

# ---------------- FRONT LOGIN PAGE ----------------
@app.get("/", response_class=HTMLResponse)
async def login_page():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Login Admin - Closet da Jacy</title>
        <style>
            body { font-family: Arial; max-width: 400px; margin: 100px auto; padding: 20px; }
            input, button { width: 100%; padding: 12px; margin: 8px 0; box-sizing: border-box; }
            button { background: #a77e85; color: white; border: none; cursor: pointer; }
            .error { color: red; }
        </style>
    </head>
    <body>
        <h2>🔐 Login Admin</h2>
        <form id="loginForm">
            <input type="text" id="username" placeholder="Usuário" required>
            <input type="password" id="password" placeholder="Senha" required>
            <button type="submit">Entrar</button>
            <p class="error" id="error"></p>
        </form>

        <script>
            document.getElementById('loginForm').addEventListener('submit', async (e) => {
                e.preventDefault();

                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;

                try {
                    const res = await fetch('/token', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({username, password})
                    });

                    if (res.ok) {
                        const data = await res.json();
                        localStorage.setItem('token', data.access_token);
                        window.location.href = '/admin';
                    } else {
                        document.getElementById('error').textContent = 'Credenciais inválidas';
                    }
                } catch (err) {
                    document.getElementById('error').textContent = 'Erro de conexão';
                }
            });
        </script>
    </body>
    </html>
    """

# ---------------- ADMIN ----------------
@app.get("/admin")
async def admin_page(current_user: TokenData = Depends(get_current_user)):
    return RedirectResponse(url="/static/index.html")

# ---------------- LOGIN ----------------
@app.post("/token")
async def login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = authenticate_usuario(db, username, password)

    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": user.username})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

# ---------------- PRODUTOS ----------------
@app.post("/produtos/")
async def create_produto_endpoint(
    nome: str = Form(...),
    descricao: str = Form(...),
    preco: float = Form(...),
    imagem: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    produto_data = ProdutoCreate(
        nome=nome,
        descricao=descricao,
        preco=preco
    )

    return create_produto(db=db, produto=produto_data, imagem=imagem)


@app.get("/produtos/", response_model=List[Produto])
async def read_produtos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_produtos(db, skip=skip, limit=limit)


@app.get("/produtos/{produto_id}", response_model=Produto)
async def read_produto(
    produto_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    produto = get_produto(db, produto_id)

    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    return produto


@app.put("/produtos/{produto_id}", response_model=Produto)
async def update_produto_endpoint(
    produto_id: int,
    produto: ProdutoCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    updated = update_produto(db, produto_id, produto)

    if not updated:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    return updated


@app.delete("/produtos/{produto_id}")
async def delete_produto_endpoint(
    produto_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    success = delete_produto(db, produto_id)

    if not success:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    return {"message": "Produto deletado com sucesso"}