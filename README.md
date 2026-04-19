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

---

## 🚀 Como Rodar

### Pré-requisitos
- Node.js 18+
- MongoDB 6+ (local ou Atlas)
- npm

### Backend

```bash
cd nuckleo/backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Iniciar em desenvolvimento
npm run dev

# Iniciar em produção
npm start
```

### Frontend

Abra `frontend/index.html` em um servidor local:

```bash
# Opção 1: VS Code Live Server (extensão)
# Opção 2:
npx serve frontend

# Opção 3: Python
python3 -m http.server 3000 --directory frontend
```

Acesse: `http://localhost:3000`

---

## 🔌 Variáveis de Ambiente (.env)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/nuckleo
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=seu_google_client_id
CLIENT_URL=http://localhost:3000
```

---

## 📡 Rotas da API

### Auth
| Método | Rota                    | Descrição           |
|--------|-------------------------|---------------------|
| POST   | `/api/auth/register`    | Registrar           |
| POST   | `/api/auth/login`       | Login               |
| POST   | `/api/auth/google`      | OAuth Google        |
| GET    | `/api/auth/me`          | Usuário atual       |

### Espaços
| Método | Rota                        | Descrição           |
|--------|-----------------------------|---------------------|
| GET    | `/api/spaces`               | Listar espaços      |
| POST   | `/api/spaces`               | Criar espaço        |
| GET    | `/api/spaces/:id`           | Ver espaço          |
| PUT    | `/api/spaces/:id`           | Editar espaço       |
| DELETE | `/api/spaces/:id`           | Deletar espaço      |
| GET    | `/api/spaces/:id/items`     | Itens do espaço     |
| POST   | `/api/spaces/:id/items`     | Adicionar item      |
| GET    | `/api/spaces/shared/:token` | Espaço público      |

### Itens
| Método | Rota                       | Descrição           |
|--------|----------------------------|---------------------|
| GET    | `/api/items/:id`           | Ver item            |
| PUT    | `/api/items/:id`           | Editar item         |
| DELETE | `/api/items/:id`           | Deletar item        |
| GET    | `/api/items/favorites`     | Favoritos           |
| GET    | `/api/items/shared/:token` | Item público        |

### Usuários
| Método | Rota                              | Descrição           |
|--------|-----------------------------------|---------------------|
| GET    | `/api/users/:username`            | Perfil público      |
| PUT    | `/api/users/me/profile`           | Editar perfil       |
| PUT    | `/api/users/me/preferences`       | Preferências        |
| GET    | `/api/users/friends`              | Listar amigos       |
| GET    | `/api/users/search?q=`            | Buscar usuários     |
| POST   | `/api/users/:id/friend-request`   | Enviar solicitação  |
| POST   | `/api/users/:id/accept-friend`    | Aceitar solicitação |
| DELETE | `/api/users/:id/friend`           | Remover amigo       |

### Outros
| Método | Rota                        | Descrição           |
|--------|-----------------------------|---------------------|
| GET    | `/api/search?q=`            | Busca global        |
| GET    | `/api/notifications`        | Notificações        |
| PUT    | `/api/notifications/read-all` | Marcar lidas      |
| GET    | `/api/health`               | Health check        |

---

## 🗃️ Modelos do Banco

### User
```
name, username, email, password (hash), avatar, bio, website
googleId, appleId
preferences: { theme, accentColor, language, emailNotifications }
friends[], pendingRequests[], sentRequests[]
isVerified, isActive, lastSeen, role
```

### Space
```
name, description, icon (emoji), coverColor (HEX)
owner (ref: User)
visibility: public | private
shareToken (UUID)
tags[], isPinned, isFavorite, sortOrder
itemCount (denormalized)
```

### Item
```
title, type: note | link | file | code
owner (ref: User), spaceId (ref: Space)
content (rich text)
meta: { url, previewTitle, ..., fileName, fileSize, ..., language, code }
visibility: public | private
shareToken (UUID)
tags[], isPinned, isFavorite
viewCount
```

### Notification
```
recipient (ref: User), sender (ref: User)
type: friend_request | friend_accepted | space_shared | item_shared | mention | system
title, message, link, isRead
```

---

## 🎯 Funcionalidades Implementadas

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

## 🔮 Roadmap (Fases Futuras)

### Fase 2 — Grupos & Chat
- [ ] Modelo Group com membros e papéis
- [ ] Chat em tempo real via WebSocket (Socket.IO)
- [ ] Envio de arquivos no chat
- [ ] Threads e reações

### Fase 3 — Colaboração
- [ ] Edição colaborativa de notas (CRDT ou OT)
- [ ] Comentários em itens
- [ ] Histórico de versões

### Fase 4 — Inteligência
- [ ] Resumo automático de notas (LLM)
- [ ] Sugestão de tags
- [ ] Busca semântica (embeddings)

### Fase 5 — Migração SQL
- [ ] Mover `authService`, `spaceService`, `itemService` para PostgreSQL via Prisma
- [ ] A camada de controllers/routes permanece intacta (zero reescrita)

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

## 📄 Licença

MIT — Use à vontade para projetos pessoais e comerciais.
