# 🧠 Nuckleo — Your Second Brain

> Organize, armazene e compartilhe seu conhecimento com uma plataforma SaaS moderna, escalável e visualmente refinada.

---

## 🎨 Paleta de Cores

| Nome         | HEX       | RGB               |
|--------------|-----------|-------------------|
| Candy Floss  | `#F0F9F8` | 240 / 249 / 248   |
| Mint         | `#C6E6E3` | 198 / 230 / 227   |
| Wintergreen  | `#81BFB7` | 129 / 191 / 183   |

---

## 📁 Estrutura do Projeto

```
nuckleo/
├── frontend/               # HTML, CSS, JavaScript puro
│   ├── index.html          # Entry point / App Shell
│   ├── app.js              # Orquestrador principal + Modal Manager
│   ├── styles/
│   │   ├── tokens.css      # Design tokens, variáveis, temas
│   │   ├── reset.css       # Reset e base
│   │   ├── layout.css      # Shell, sidebar, páginas
│   │   ├── components.css  # Botões, cards, modais, inputs
│   │   ├── animations.css  # Keyframes e stagger
│   │   └── responsive.css  # Media queries
│   ├── utils/
│   │   ├── api.js          # Camada de comunicação com a API
│   │   ├── state.js        # State manager reativo simples
│   │   └── helpers.js      # Utilitários (tempo, DOM, toast, etc.)
│   ├── components/
│   │   ├── spaceCard.js    # Componente de cartão de espaço
│   │   ├── itemCard.js     # Componente de cartão de item
│   │   └── userCard.js     # Componente de cartão de usuário
│   └── pages/
│       ├── auth.js         # Tela de login/registro
│       ├── dashboard.js    # Dashboard principal
│       ├── spaces.js       # Listagem de espaços
│       ├── spaceDetail.js  # Detalhe de espaço + itens
│       ├── favorites.js    # Itens favoritos
│       └── friends.js      # Sistema social
│
└── backend/                # Node.js + Express + MongoDB
    ├── server.js            # Entry point
    ├── .env.example         # Variáveis de ambiente
    ├── config/
    │   └── database.js      # Conexão MongoDB (abstraída)
    ├── models/
    │   ├── User.js          # Modelo de usuário
    │   ├── Space.js         # Modelo de espaço
    │   ├── Item.js          # Modelo de item (note/link/file/code)
    │   └── Notification.js  # Modelo de notificação
    ├── routes/
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   ├── spaceRoutes.js
    │   ├── itemRoutes.js
    │   ├── searchRoutes.js
    │   └── notificationRoutes.js
    ├── controllers/
    │   ├── authController.js
    │   ├── userController.js
    │   ├── spaceController.js
    │   └── itemController.js
    ├── services/
    │   ├── authService.js    # Lógica de autenticação
    │   ├── userService.js    # Lógica de usuários/amigos
    │   ├── spaceService.js   # CRUD de espaços
    │   └── itemService.js    # CRUD de itens
    ├── middlewares/
    │   ├── authMiddleware.js    # JWT protect/optionalAuth
    │   ├── errorMiddleware.js   # Error handler global
    │   ├── rateLimiter.js       # Rate limiting
    │   ├── uploadMiddleware.js  # Multer (PDF, imagens, código)
    │   └── validateMiddleware.js# express-validator
    └── utils/
        ├── errorUtils.js    # createError helper
        └── tokenUtils.js    # JWT generate + build response
```

## 🎯 Funcionalidades do Site

### Frontend
- [x] Autenticação (email/senha + Google OAuth)
- [x] Tema claro/escuro com transição suave
- [x] Cor de destaque customizável via HEX
- [x] Sidebar com navegação e espaços recentes
- [x] Dashboard com stats e conteúdo recente
- [x] CRUD de espaços com ícone emoji e cor
- [x] 4 tipos de itens: nota, link, código, arquivo
- [x] Editor de notas (rich text via contenteditable)
- [x] Upload de arquivos
- [x] Sistema de tags
- [x] Favoritos e fixados
- [x] Busca global (⌘K)
- [x] Painel de notificações
- [x] Sistema social (amigos, solicitações)
- [x] Compartilhamento via link/token
- [x] Responsivo (mobile + desktop)
- [x] Animações e micro-interações

### Backend
- [x] API REST com Express
- [x] MongoDB com Mongoose
- [x] JWT Authentication
- [x] Google OAuth via token verification
- [x] CRUD completo: usuários, espaços, itens
- [x] Sistema de privacidade (público/privado)
- [x] Share tokens (UUID)
- [x] Sistema de amigos com notificações
- [x] Busca full-text (MongoDB text index)
- [x] Rate limiting
- [x] Upload com Multer
- [x] Camada de abstração nos services
- [x] Tratamento de erros global
- [x] Validação com express-validator

---

## ⚙️ Decisões de Arquitetura

| Decisão | Motivo |
|---------|--------|
| Services layer | Isola lógica do banco, facilita troca MongoDB→SQL |
| Refs em vez de embedding | Queries independentes, evita docs gigantes |
| share tokens UUID | Partilha pública sem expor IDs internos |
| CSS variables | Tema dinâmico sem JS, suporte a customização por usuário |
| Componentes JS puros | Reutilizáveis, prontos para migração React |
| State manager próprio | Sem dependência, < 30 linhas, pub/sub simples |

---
