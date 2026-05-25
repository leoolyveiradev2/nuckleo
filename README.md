# Nuckleo — Your Second Brain

> Organize, armazene e compartilhe seu conhecimento com uma plataforma moderna, escalável e visualmente refinada.

Nuckleo é um “Second Brain” focado em:
- Guardar informações importantes
- Compartilhar conteúdo de forma simples
- Criar uma rede de aprendizado entre usuários

Inspirado em:
- Notion
- Obsidian
- Pinterest (salvar ideias)

---

## Paleta de Cores

| Nome         | HEX       | RGB               |
|--------------|-----------|-------------------|
| Candy Floss  | `#F0F9F8` | 240 / 249 / 248   |
| Mint         | `#C6E6E3` | 198 / 230 / 227   |
| Wintergreen  | `#81BFB7` | 129 / 191 / 183   |

---

## 🧩 Design System

O Nuckleo utiliza um design system baseado em:

- CSS Variables (tokens.css)
- Componentização via classes reutilizáveis
- Sistema de espaçamento de 8px
- Tema dark-first com suporte a light mode
- Accent color dinâmica definida pelo usuário

### Estrutura:

- tokens.css → cores, espaçamento, tipografia
- components.css → UI components
- animations.css → micro-interações

---

## Estrutura do Projeto

```txt
nuckleo/            
├─ docs (frontend)/                # Web app (HTML/CSS/JS puro)
│  ├─ index.html
│  ├─ app.js                      # DrawerMenu + Modal + App router
│  ├─ CNAME
│  ├─ utils/
│  │  ├─ api.js                   # Camada HTTP para o backend
│  │  ├─ state.js                 # Estado global (read/write no front)
│  │  └─ helpers.js               # Utilitários (DOM/toast/time/etc.)
│  ├─ pages/
│  │  ├─ auth.js                 # Login/registro
│  │  ├─ dashboard.js            # Dashboard (stats + cards)
│  │  ├─ spaces.js               # Listagem + filtros
│  │  ├─ spaceDetail.js          # Detalhe de espaço + itens
│  │  ├─ favorites.js            # Favoritos
│  │  └─ friends.js              # Social: amigos/solicitações
│  ├─ components/
│  │  ├─ spaceCard.js
│  │  ├─ itemCard.js
│  │  ├─ userCard.js
│  │  ├─ profileMenu.js
│  │  └─ profileFlyout.js
│  ├─ styles/
│  │  ├─ reset.css
│  │  ├─ tokens.css
│  │  ├─ components.css
│  │  ├─ animations.css
│  │  ├─ responsive.css
│  │  └─ style.css
│  ├─ photos/
│  │
|  ├─ app.js 
|  |                     # Assets do frontend (favicon/logos)
│
└─ backend/                       # Node.js + Express + MongoDB
   ├─ package.json
   ├─ server.js                   # Entry point
   ├─ config/
   │  └─ database.js             # Conexão MongoDB (Mongoose)
   ├─ models/
   │  ├─ User.js
   │  ├─ Space.js
   │  ├─ Item.js
   │  └─ Notification.js
   ├─ routes/
   │  ├─ authRoutes.js
   │  ├─ userRoutes.js
   │  ├─ spaceRoutes.js
   │  ├─ itemRoutes.js
   │  ├─ searchRoutes.js
   │  └─ notificationRoutes.js
   ├─ controllers/
   │  ├─ authController.js
   │  ├─ userController.js
   │  ├─ spaceController.js
   │  └─ itemController.js
   ├─ services/
   │  ├─ authService.js
   │  ├─ userService.js
   │  ├─ spaceService.js
   │  └─ itemService.js
   ├─ middlewares/
   │  ├─ authMiddleware.js
   │  ├─ errorMiddleware.js
   │  ├─ rateLimiter.js
   │  ├─ uploadMiddleware.js
   │  └─ validateMiddleware.js
   └─ utils/
      ├─ errorUtils.js
      └─ tokenUtils.js

# Observação
# - node_modules/ (backend) e (quando existir) node_modules/ (front) não são versionados.
# - Elas devem ser instaladas via npm/yarn/pnpm com base no backend/package.json.
```


---

## Funcionalidades

### Frontend (docs/)
- [x] Autenticação (email/senha + Google OAuth)
- [x] Tema claro/escuro com transição suave
- [x] Cor de destaque (accent) customizável via HEX
- [x] Drawer/sidebar com navegação e espaços recentes
- [x] Dashboard com stats e conteúdo recente
- [x] CRUD de espaços (emoji + cor + visibilidade)
- [x] 4 tipos de itens: nota, link, código, arquivo
- [x] Editor de notas (rich text via contenteditable)
- [x] Upload de arquivos (com preview)
- [x] Sistema de tags (#tags)
- [x] Favoritos e fixados
- [x] Busca global (⌘K / Ctrl+K) — usuários, espaços e itens
- [x] Painel de notificações
- [x] Sistema social (amigos, solicitações e remoção)
- [x] Compartilhamento via link/token (somente itens públicos)
- [x] Responsivo (mobile + desktop)
- [x] Animações e micro-interações

### Backend (backend/)
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
- [x] Camada de abstração (services)
- [x] Tratamento de erros global
- [x] Validação com express-validator

---

## Decisões de Arquitetura

| Decisão | Motivo |
|---------|--------|
| Services layer | Isola lógica do banco e facilita evolução |
| Refs em vez de embedding | Evita documentos gigantes e mantém queries independentes |
| Share tokens UUID | Compartilhamento público sem expor IDs internos |
| CSS variables | Tema dinâmico e customização sem dependência de frameworks |
| Componentes JS puros | Estrutura pronta para evoluir sem acoplamento |
| State manager próprio | Simples, com pub/sub leve |

## 🔮 Futuro

- [ ] Sistema de IA (resumo de notas)
- [ ] Recomendações inteligentes
- [ ] Colaboração em tempo real

