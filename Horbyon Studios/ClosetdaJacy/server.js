const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------------------
// Conectar ao MongoDB
// ---------------------------
const uri = 'mongodb+srv://leoolyveiradev:203040%40LeoDev@leoolyveiradev.qfahqph.mongodb.net/ClosetdaJacy?retryWrites=true&w=majority&appName=leoolyveiradev';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB conectado!"))
  .catch(err => console.error("Erro ao conectar ao MongoDB:", err));

// ---------------------------
// Schemas e Models
// ---------------------------

// Usuários
const UsuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  role: { type: String, enum: ['admin', 'cliente'], default: 'cliente' },
  criadoEm: { type: Date, default: Date.now }
});
const Usuario = mongoose.model('Usuario', UsuarioSchema);

// Produtos
const ProdutoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  descricao: { type: String },
  preco: { type: Number, required: true },
  imagemUrl: { type: String },
  estoque: { type: Number, default: 1 },
  criadoEm: { type: Date, default: Date.now }
});
const Produto = mongoose.model('Produto', ProdutoSchema);

// Pedidos
const PedidoSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  produtos: [
    {
      produtoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Produto', required: true },
      quantidade: { type: Number, default: 1 }
    }
  ],
  total: { type: Number, required: true },
  status: { type: String, enum: ['pendente', 'pago', 'enviado', 'entregue'], default: 'pendente' },
  criadoEm: { type: Date, default: Date.now }
});
const Pedido = mongoose.model('Pedido', PedidoSchema);

// ---------------------------
// Middleware para autenticação JWT
// ---------------------------
function verificarAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token inválido' });

  try {
    const decoded = jwt.verify(token, 'segredo'); // Em produção use variável de ambiente
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Acesso negado' });

    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

// Middleware para autenticação geral (admin ou cliente)
function verificarUsuario(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token inválido' });

  try {
    const decoded = jwt.verify(token, 'segredo');
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

// ---------------------------
// Configurar multer para upload de imagens
// ---------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ---------------------------
// Rotas
// ---------------------------

// Cadastro de usuário (cliente)
app.post('/usuarios', async (req, res) => {
  try {
    const { nome, email, senha, role } = req.body;
    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = new Usuario({ nome, email, senha: senhaHash, role });
    await usuario.save();
    res.status(201).json({ message: 'Usuário criado com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login de usuário
app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(400).json({ error: 'Usuário não encontrado' });

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) return res.status(400).json({ error: 'Senha incorreta' });

    const token = jwt.sign({ id: usuario._id, role: usuario.role }, 'segredo', { expiresIn: '1h' });
    res.json({ usuario: { nome: usuario.nome, email: usuario.email, role: usuario.role }, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Adicionar produto (somente admin)
app.post('/produtos', verificarAdmin, upload.single('imagem'), async (req, res) => {
  try {
    const { nome, descricao, preco, estoque } = req.body;
    const imagemUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const produto = new Produto({ nome, descricao, preco, imagemUrl, estoque });
    await produto.save();
    res.status(201).json(produto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar produtos (todos)
app.get('/produtos', async (req, res) => {
  const produtos = await Produto.find();
  res.json(produtos);
});

// Criar pedido (somente clientes logados)
app.post('/pedidos', verificarUsuario, async (req, res) => {
  try {
    const { produtos, total } = req.body;
    const usuarioId = req.usuario.id;
    const pedido = new Pedido({ usuarioId, produtos, total });
    await pedido.save();
    res.status(201).json(pedido);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar pedidos (admin vê todos, cliente vê só os dele)
app.get('/pedidos', verificarUsuario, async (req, res) => {
  try {
    let pedidos;
    if (req.usuario.role === 'admin') {
      pedidos = await Pedido.find().populate('produtos.produtoId').populate('usuarioId');
    } else {
      pedidos = await Pedido.find({ usuarioId: req.usuario.id }).populate('produtos.produtoId');
    }
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------
// Rota para criar um usuário admin (apenas para uso inicial)
// ---------------------------
app.post('/criar-admin', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    const senhaHash = await bcrypt.hash(senha, 10);
    const usuarioAdmin = new Usuario({ nome, email, senha: senhaHash, role: 'admin' });
    await usuarioAdmin.save();
    res.status(201).json({ message: 'Admin criado com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------
// Iniciar servidor
// ---------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));