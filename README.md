# FIAP Cloud Games (FCG) - Front-end

Interface web moderna desenvolvida para a plataforma de jogos em nuvem **FIAP Cloud Games (FCG)**, unificando todos os microsserviços do ecossistema: **Users API**, **Catalog API**, **Payments Worker**, **Catalog Worker** e **Notifications**.

---

## 🚀 Tecnologias Utilizadas

* **Framework & Core**: [React 19](https://react.dev/) com [TypeScript](https://www.typescriptlang.org/) e [Vite](https://vitejs.dev/)
* **Roteamento**: [React Router 7](https://reactrouter.com/) (com proteção de rotas públicas, privadas e de administrador)
* **Comunicação HTTP**: [Axios](https://axios-http.com/) com interceptors para injeção automática de JWT e tratamento centralizado de erros
* **Autenticação**: Tokens JWT com claims decodificados via `jwt-decode`
* **Estilização**: Design System Vanilla CSS com estética gamer cyberpunk, paleta escura, glassmorphism, micro-animações e responsividade
* **Ícones**: [Lucide React](https://lucide.dev/)
* **Containerização & Orquestração**: Docker (Multi-stage build com Nginx Alpine), Docker Compose e Manifests Kubernetes (`k8s/`)

---

## 🎮 Funcionalidades e Módulos

### 1. Loja & Catálogo de Jogos (Storefront)
* **Vitrine Dinâmica**: Listagem de jogos em cards com preço, categorias e imagem.
* **Filtros e Busca**: Pesquisa instantânea por título/descrição e filtros por categorias.
* **Página de Detalhes do Jogo**: Informações detalhadas, visualização de notas e compra direta.
* **Sistema de Avaliações (Reviews)**:
  * Armazenado no MongoDB do microsserviço de catálogo.
  * Cadastro, edição e exclusão de avaliações pelo autor.
  * Votação em reviews úteis (`helpful-votes`).

### 2. Autenticação & Gestão de Conta
* **Login & Cadastro**: Formulários validados integrados ao `Users API`.
* **Perfil do Usuário**: Atualização de dados cadastrais e alteração de senha segura.
* **Controle de Acesso RBAC**: Distinção automática entre usuários comuns e administradores (`Admin`).

### 3. Carrinho & Checkout
* **Carrinho Lateral (Drawer)**: Gerenciamento de itens com persistência local.
* **Checkout & Fechamento de Pedido**: Disparo de ordens de compra (`POST /api/GameOrders`) que publicam eventos no RabbitMQ para processamento de pagamentos.
* **Histórico de Pedidos**: Listagem do status de todas as compras realizadas pelo usuário.

### 4. Minha Biblioteca (Cloud Library)
* **Jogos Adquiridos**: Listagem de todos os jogos pertencentes ao usuário após a confirmação do pagamento pelo worker.
* **Execução em Nuvem**: Atalho para jogar os títulos disponíveis.

### 5. Painel Administrativo (Backoffice)
* **Dashboard**: Métricas do ecossistema e topologia de microsserviços.
* **Gestão de Jogos (CRUD)**: Cadastro, atualização de preço/categorias e exclusão de títulos.
* **Gestão de Categorias (CRUD)**: Gestão dos gêneros de jogos da plataforma.
* **Gestão de Usuários**: Cadastro de novos administradores (`POST /api/User/admin`) e exclusão de contas.

---

## 🛠️ Como Executar Localmente

### Pré-requisitos
* Node.js (v20 ou superior)
* NPM ou Yarn

### 1. Instalação e Execução
```bash
# Clone o repositório e acesse a pasta
cd FCG-Frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

> **Nota:** o front-end sempre chama caminhos relativos (`/api/Game`, `/api/User`, etc.) e não utiliza variáveis de ambiente. Quem resolve cada rota para o microsserviço correto é o Ingress do cluster (em produção) ou o proxy do seu servidor de desenvolvimento local.

### 2. Scripts Disponíveis
| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento com hot reload (Vite) |
| `npm run build` | Checagem de tipos (`tsc -b`) e build de produção |
| `npm run lint` | Executa o lint do projeto (`oxlint`) |
| `npm run preview` | Serve localmente o build de produção gerado em `dist/` |

---

## 📁 Estrutura do Projeto
```
src/
├── assets/         # Imagens e ícones estáticos
├── components/     # Componentes reutilizáveis (Navbar, CartDrawer, GameCard, etc.)
├── context/         # Contextos globais (Auth, Cart, Toast)
├── layouts/         # Layout principal da aplicação
├── pages/           # Páginas por domínio (auth, store, checkout, library, orders, profile, admin)
├── routes/          # Definição de rotas e guards de acesso (público/privado/admin)
├── services/        # Clientes HTTP e chamadas às APIs (auth, catalog, orders, reviews)
├── types/           # Tipagens TypeScript compartilhadas
└── utils/           # Funções utilitárias (ex.: validação de CPF)
```

---

## 🐳 Executando com Docker & Docker Compose

### Build e execução isolada
```bash
# Build da imagem Docker
docker build -t fcg-frontend:latest .

# Execução do container
docker run -d -p 3000:80 --name fcg-frontend fcg-frontend:latest
```

### Execução integrada na rede `fcg-network`
```bash
docker compose up -d
```

---

## ☸️ Deploy no Kubernetes

Para implantar no cluster local (Minikube / Kind) ou nuvem:

```bash
# Aplicar Deployment e Service
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

---

## 🔗 Mapeamento de Endpoints Integrados

| Microsserviço | Método | Endpoint | Ação no Front-end |
| :--- | :--- | :--- | :--- |
| **Users API** | `POST` | `/api/Access/login` | Login do usuário e geração do token JWT |
| **Users API** | `POST` | `/api/User` | Registro de novo usuário |
| **Users API** | `POST` | `/api/User/admin` | Cadastro de novo administrador |
| **Users API** | `PUT` | `/api/User/{id}` | Atualização de dados do perfil |
| **Users API** | `PUT` | `/api/User/change-password` | Alteração de senha |
| **Users API** | `DELETE`| `/api/User/{id}` | Exclusão de conta de usuário |
| **Catalog API** | `GET` | `/api/Game` | Listagem e filtros do catálogo de jogos |
| **Catalog API** | `GET` | `/api/Game/{id}` | Consulta de detalhes do jogo |
| **Catalog API** | `POST/PUT/DELETE` | `/api/Game` | CRUD de jogos (Admin) |
| **Catalog API** | `GET` | `/api/Category` | Listagem de categorias |
| **Catalog API** | `POST/PUT/DELETE` | `/api/Category` | CRUD de categorias (Admin) |
| **Catalog API** | `POST` | `/api/GameOrders` | Criação de pedido de compra |
| **Catalog API** | `GET` | `/api/GameOrders` | Histórico de pedidos do usuário |
| **Catalog API** | `GET` | `/api/Library` | Jogos adquiridos do usuário |
| **Catalog API** | `GET` | `/api/Reviews` | Listagem de avaliações (MongoDB) |
| **Catalog API** | `POST/PUT/DELETE` | `/api/Reviews` | Gestão de avaliações de jogos |
| **Catalog API** | `POST` | `/api/Reviews/{id}/helpful-votes` | Votação em reviews úteis |
