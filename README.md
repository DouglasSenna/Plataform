# API de Rastreadores - Documentação Completa

## 📚 Sobre Este Projeto

Esta é uma **plataforma de rastreamento GPS profissional** desenvolvida com:

- **Node.js + Express** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **Sequelize** - ORM (Object-Relational Mapping)
- **JWT** - Autenticação e autorização
- **Bcrypt** - Hashing de senhas

### 🎯 Objetivo Educacional

Este projeto foi construído com **objetivo didático para estudantes de fullstack**, com:

- ✅ Código 100% comentado e explicado
- ✅ Estrutura profissional e escalável
- ✅ Padrões de design (MVC, Repository, Service)
- ✅ Autenticação com tokens JWT
- ✅ Relacionamentos Sequelize (1:N, N:1)
- ✅ Tratamento de erros robusto
- ✅ Permissões e controle de acesso

---

## 🏗️ Arquitetura do Projeto

### Estrutura de Pastas

```
src/
├── models/           # Definem a estrutura dos dados
│   ├── user.js       # Usuário/Cliente
│   ├── veiculo.js    # Veículo
│   ├── rastreador.js # Rastreador GPS
│   └── chip.js       # Chip SIM
│
├── repositories/     # Acesso a dados (database abstraction)
│   ├── userRepository.js
│   ├── veiculoRepository.js
│   ├── rastreadorRepository.js
│   └── chipRepository.js
│
├── services/         # Lógica de negócio
│   └── authService.js    # JWT, login, logout
│
├── controllers/      # Orquestração de requisições
│   ├── authController.js
│   ├── veiculoController.js
│   ├── rastreadorController.js
│   ├── chipController.js
│   ├── userController.js
│   └── dashboardController.js
│
├── routes/          # Definição de endpoints HTTP
│   ├── auth.js
│   ├── veiculos.js
│   ├── rastreadores.js
│   ├── chips.js
│   ├── users.js
│   ├── dashboard.js
│   └── index.js
│
├── middlewares/     # Interceptadores de requisições
│   └── authMiddleware.js
│
├── database/        # Configuração do banco
│   └── index.js
│
├── app.js          # Configuração Express
├── server.js       # Inicialização do servidor
└── config/         # Arquivos de configuração
```

---

## 📋 Entidades e Relacionamentos

### Estrutura de Dados

#### 1. **USER (Usuário/Cliente)**

```javascript
{
  id: Integer,
  login: String (único),
  password: String (hasheado com bcrypt),
  ip: String (opcional),
  isAdmin: Boolean,
  refreshTokenVersion: Integer, // Para invalidar tokens
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. **VEICULO (Veículo)**

```javascript
{
  id: Integer,
  userId: Integer (FK -> User), // Qual usuário é dono
  placa: String (única),
  modelo: String,
  ano: Integer,
  cor: String,
  rastreadorId: Integer (FK -> Rastreador, nullable), // Um veiculo pode ter 0 ou 1 rastreador
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. **RASTREADOR (Rastreador GPS)**

```javascript
{
  id: Integer,
  imei: String (única),
  modelo: String,
  protocolo: String (GT06, T4H, etc),
  veiculoId: Integer (FK -> Veiculo, nullable), // Um rastreador pode ter 0 ou 1 veiculo
  chipId: Integer (FK -> Chip, nullable), // Um rastreador pode ter 0 ou 1 chip
  plataforma: String,
  ativo: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 4. **CHIP (Chip SIM)**

```javascript
{
  id: Integer,
  iccid: String (única), // Identificador do chip
  linha: String, // Número telefônico
  operadora: String (Vivo, Claro, TIM, etc),
  apn: String, // Access Point Name para internet
  porta: Integer, // Porta de comunicação
  rastreadorId: Integer (FK -> Rastreador, nullable), // Um chip pode ter 0 ou 1 rastreador
  ativo: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 📊 Diagrama de Relacionamentos

```
┌─────────────────┐
│     USER        │
│                 │
│  id (PK)        │
│  login          │
│  password       │
│  ip             │
│  isAdmin        │
└────────┬────────┘
         │
         │ 1:N (um usuário tem muitos veículos)
         │
    ┌────┴─────────────────────┐
    │                          │
┌───▼───────────────┐   N:1    │
│     VEICULO       │          │
│                   │          │
│  id (PK)          │          │
│  userId (FK) ─────┴──────────┘
│  placa
│  modelo
│  ano
│  rastreadorId (FK) ─┐
└───────────────────┘ │
                      │
                   0..1 │
                      │
    ┌─────────────────┴──────────────────┐
    │                                    │
┌───▼────────────────────┐     N:1   ┌───▼──────────────────┐
│   RASTREADOR          │───────────│     CHIP             │
│                       │           │                      │
│  id (PK)              │           │  id (PK)             │
│  imei (unique)        │           │  iccid (unique)      │
│  modelo               │           │  linha               │
│  protocolo            │           │  operadora           │
│  veiculoId (FK) ──────┴──────────│  apn                 │
│  chipId (FK) ───────────────────┼─→ porta               │
│  plataforma           │           │  rastreadorId (FK)   │
│  ativo                │           │  ativo               │
└───────────────────────┘           └──────────────────────┘
```

---

## 🔐 Autenticação e Autorização

### Sistema de Tokens JWT

#### Access Token (15 minutos)

- **Duração curta**: Expira a cada 15 minutos
- **Payload**: `{ id, login, isAdmin }`
- **Uso**: Enviado em TODAS as requisições autenticadas
- **Header**: `Authorization: Bearer <access_token>`

#### Refresh Token (7 dias)

- **Duração longa**: Válido por 7 dias
- **Payload**: `{ id, version }`
- **Uso**: Usado APENAS para renovar access token
- **Armazenamento**: localStorage (client-side)

### 🔄 Fluxo de Autenticação

```
1. REGISTRO
   POST /auth/register
   Body: { login, password, ip? }
   → Criptografa senha com bcrypt(10 rounds)
   → Cria usuário no banco
   ← Response: { id, login, ip, createdAt }

2. LOGIN
   POST /auth/login
   Body: { login, password, ip? }
   → Busca usuário por login
   → Valida senha com bcrypt.compare()
   → Gera Access Token (15m)
   → Gera Refresh Token (7d)
   ← Response: { access_token, refresh_token, user }

3. USAR ACCESS TOKEN
   GET /veiculos
   Header: Authorization: Bearer <access_token>
   → Middleware verifyToken valida JWT
   → Injeta req.user = { id, login, isAdmin }

4. RENOVAR QUANDO EXPIRAR (15m)
   POST /auth/refresh
   Body: { refresh_token }
   → Valida refresh token
   → Verifica refreshTokenVersion
   → Gera novo access token
   ← Response: { access_token, expiresIn }

5. LOGOUT
   POST /auth/logout
   Header: Authorization: Bearer <access_token>
   → Incrementa refreshTokenVersion
   → Todos os tokens antigos ficam inválidos
   ← Response: { message }
```

---

## 🚀 Instalação e Setup

### 1. Pré-requisitos

- Node.js 16+
- PostgreSQL 12+
- npm ou yarn

### 2. Clonar e Instalar

```bash
# Clonar projeto
git clone <repo> api-rastreadores
cd api-rastreadores

# Instalar dependências
npm install

# Criar arquivo .env
cp .env.example .env
# Editar .env com suas credenciais
```

### 3. Configurar Banco de Dados

```bash
# Criar banco PostgreSQL
createdb api_rastreadores

# (Sequelize vai criar as tabelas automaticamente)
```

### 4. Editar .env

```bash
# Arquivo: .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=api_rastreadores
DB_USER=seu_usuario_postgres
DB_PASSWORD=sua_senha

JWT_SECRET=uma_string_aleatoria_super_secreta_32_caracteres_minimo
REFRESH_JWT_SECRET=outra_string_aleatoria_diferente_32_caracteres_minimo

PORT=3000
NODE_ENV=development
```

### 5. Rodar Servidor

```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start
```

**Saída esperada:**

```
✅ Banco de dados conectado com sucesso!
✅ Tabelas sincronizadas com sucesso!
Servidor rodando na porta 3000
```

---

## 📡 Endpoints da API

### 🔓 Autenticação (Público)

```
POST /auth/register
Body: { login, password, ip? }
Response: 201 { user }

POST /auth/login
Body: { login, password, ip? }
Response: 200 { access_token, refresh_token, user }

POST /auth/refresh
Body: { refresh_token }
Response: 200 { access_token, expiresIn }

POST /auth/logout
Header: Authorization: Bearer <token>
Response: 200 { message }
```

### 📊 Dashboard (Autenticado)

```
GET /dashboard
Header: Authorization: Bearer <token>
Requer: isAdmin = true
Response: 200 {
  summary: { totalUsers, totalVeiculos, ... },
  veiculosSemRastreador: [],
  rastreadoresDisponiveis: [],
  chipsDisponiveis: []
}

GET /dashboard/user
Header: Authorization: Bearer <token>
Response: 200 {
  user: { id, login },
  summary: { totalVeiculos, totalRastreadores, ... },
  veiculos: [],
  rastreadores: [],
  chips: []
}
```

### 🚗 Veículos (Autenticado)

```
GET /veiculos
Header: Authorization: Bearer <token>
Response: 200 { count, veiculos }

GET /veiculos/:id
Response: 200 { veiculo }

POST /veiculos
Body: { placa, modelo, ano, cor? }
Response: 201 { message, veiculo }

PUT /veiculos/:id
Body: { placa?, modelo?, ano?, cor? }
Response: 200 { message, veiculo }

DELETE /veiculos/:id
Response: 200 { message }

POST /veiculos/:id/rastreador/associar
Body: { rastreadorId }
Response: 200 { message, veiculo }

POST /veiculos/:id/rastreador/desassociar
Response: 200 { message, veiculo }
```

### 📍 Rastreadores (Autenticado, Admin para CRUD)

```
GET /rastreadores
Response: 200 { count, rastreadores }

GET /rastreadores/:id
Response: 200 { rastreador }

GET /rastreadores/disponíveis
Response: 200 { count, rastreadores }

POST /rastreadores
Requer: isAdmin
Body: { imei, modelo, protocolo?, plataforma? }
Response: 201 { message, rastreador }

PUT /rastreadores/:id
Requer: isAdmin
Response: 200 { message, rastreador }

DELETE /rastreadores/:id
Requer: isAdmin
Response: 200 { message }

POST /rastreadores/:id/veiculo/associar
Requer: isAdmin
Body: { veiculoId }
Response: 200 { message, rastreador }

... e mais...
```

### 💾 Chips (Autenticado, Admin)

```
GET /chips
Requer: isAdmin
Query: operadora?
Response: 200 { count, chips }

GET /chips/:id
Requer: isAdmin
Response: 200 { chip }

GET /chips/disponíveis
Requer: isAdmin
Response: 200 { count, chips }

POST /chips
Requer: isAdmin
Body: { iccid, linha, operadora, apn, porta }
Response: 201 { message, chip }

... PUT, DELETE, associações ...
```

### 👥 Usuários (Admin Only)

```
GET /users
Requer: isAdmin
Response: 200 { count, users }

GET /users/:id
Requer: isAdmin
Response: 200 { user com dados relacionados }

PATCH /users/:id/admin
Requer: isAdmin
Body: { isAdmin: true|false }
Response: 200 { message, user }

DELETE /users/:id
Requer: isAdmin
Response: 200 { message }
```

---

## 🎓 Conceitos Ensinados

### 1. **MVC (Model-View-Controller)**

- **Model**: Define estrutura dos dados (user.js, veiculo.js)
- **Controller**: Orquestra requisições (userController.js)
- **View**: Resposta JSON (não há view no backend)

### 2. **Repository Pattern**

```javascript
// ❌ SEM Repository (ruim): lógica de banco misturada
app.get("/users", async (req, res) => {
  const users = await User.findAll(); // SQL direto no controller
});

// ✅ COM Repository (bom): separação clara
app.get("/users", async (req, res) => {
  const users = await userRepository.findAll(); // Abstração
});
```

### 3. **Autenticação com JWT**

```javascript
// Token é uma string assinada: header.payload.signature
// Client valida token no header Authorization
// Server valida assinatura com JWT_SECRET
```

### 4. **Hashing de Senhas (Bcrypt)**

```javascript
// ❌ NUNCA fazer isto:
password: "senha123"; // ← Texto plano no banco = INSEGURO!

// ✅ Fazer isto:
password: await bcrypt.hash("senha123", 10); // ← Hash com salt
// Result: $2b$10$xyz... (impossível recuperar senha original)
```

### 5. **Relacionamentos Sequelize**

```javascript
// 1:N (um para muitos)
User.hasMany(Veiculo, { foreignKey: "userId" });

// N:1 (muitos para um)
Veiculo.belongsTo(User, { foreignKey: "userId" });

// Include: join de tabelas
const user = await User.findByPk(1, {
  include: { association: "veiculos" },
});
```

---

## 🧪 Testando a API

### Com cURL ou Postman

#### 1. Registrar Usuário

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "login": "usuario@email.com",
    "password": "senha123",
    "ip": "192.168.1.1"
  }'
```

#### 2. Fazer Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "usuario@email.com",
    "password": "senha123"
  }'
```

**Resposta (salvar tokens!):**

```json
{
  "message": "Login realizado com sucesso",
  "user": { "id": 1, "login": "usuario@email.com" },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "15m"
}
```

#### 3. Usar Token para Acessar Recurso

```bash
curl -X GET http://localhost:3000/dashboard/user \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 4. Criar Veículo

```bash
curl -X POST http://localhost:3000/veiculos \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "placa": "ABC-1234",
    "modelo": "Honda Civic",
    "ano": 2023,
    "cor": "Branco"
  }'
```

---

## 🔍 Entendendo o Fluxo Completo

### Exemplo: Criar Veículo e Associar Rastreador

```javascript
1. CLIENTE faz POST /veiculos com token
   ↓
2. MIDDLEWARE verifyToken valida JWT
   ↓
3. CONTROLLER VEÍCULO recebe requisição
   ├─ Valida dados (placa, modelo, ano)
   ├─ Chama service/repository
   ↓
4. REPOSITORY (veiculoRepository)
   ├─ Valida placa única
   ├─ Cria no banco (SQL INSERT)
   ↓
5. RESPONSE retorna veículo criado
   ├─ ID é gerado pelo Sequelize
   ├─ Timestamps (createdAt, updatedAt) preenchidos

6. DEPOIS, cliente quer associar rastreador
   POST /veiculos/:id/rastreador/associar
   Body: { rastreadorId: 5 }
   ↓
7. CONTROLLER VEÍCULO
   ├─ Valida se veículo existe
   ├─ Chama repository.associarRastreador(id, rastreadorId)
   ↓
8. REPOSITORY
   ├─ Busca veículo pelo ID
   ├─ UPDATE veiculos SET rastreador_id = 5 WHERE id = 1
   ↓
9. Veículo agora tem rastreador associado ✅
```

---

## 💡 Dicas para Aprender

1. **Leia os comentários**: Cada serviço/controller tem documentação JSDoc
2. **Trace o fluxo**: Siga uma requisição do controller ao banco
3. **Teste com Postman**: Veja requests/responses em real-time
4. **Modifique o código**: Adicione console.log(), faça quebra-cabeças
5. **Estude Sequelize**: Entender ORM é crucial para fullstack
6. **Entenda JWT**: Segurança é fundamental

---

## 🚨 Erros Comuns

### "Token expirado"

- Access token dura apenas 15 minutos
- Use refresh token para gerar novo
- POST /auth/refresh com body: { refresh_token }

### "Permissão negada"

- Middleware isAdmin faz check: if (!req.user.isAdmin)
- Apenas admins podem CRUD de rastreadores e chips

### "Placa já existe"

- Placa é única no banco
- Não pode criar dois veículos com mesma placa

### "Rastreador já tem veículo"

- Um rastreador pode ter no máximo um veículo
- Desassocie antes de asociar a outro

---

## 📚 Recursos de Aprendizagem

- [Express.js](https://expressjs.com)
- [Sequelize ORM](https://sequelize.org)
- [JWT.io](https://jwt.io)
- [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js)
- [PostgreSQL](https://www.postgresql.org)

---

## ✅ Checklist de Aprendizado

- [ ] Entendo a arquitetura MVC
- [ ] Sei o que é Repository Pattern
- [ ] Consigo fazer JWT auth do zero
- [ ] Entendo bcrypt e por que usar
- [ ] Sei diferenciar access vs refresh token
- [ ] Consigo traçar o fluxo completo de uma requisição
- [ ] Entendo relacionamentos no Sequelize
- [ ] Posso explicar CORS e middlewares
- [ ] Consigo adicionar nova entidade sozinho
- [ ] Entendo permissões e controle de acesso

---

## 📞 Suporte

Para dúvidas ou sugestões, entre em contato!

**Happy coding!** 🚀
