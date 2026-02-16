## 🚀 GUIA COMPLETO DE APRENDIZADO E SETUP

Este documento ensina como entender e rodar a API de rastreadores do zero.

---

## 📖 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Setup Local](#setup-local)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Conceitos Fundamentais](#conceitos-fundamentais)
5. [Testando a API](#testando-a-api)
6. [Exercícios](#exercícios)

---

## 🔧 Pré-requisitos

Antes de começar, você precisa ter instalado:

### 1. **Node.js** (versão 16+)

```bash
# Verificar se tem Node.js
node --version
npm --version

# Se não tiver, baixe em: https://nodejs.org/
```

### 2. **PostgreSQL** (versão 12+)

```bash
# Verificar se tem PostgreSQL
psql --version

# Se não tiver, baixe em: https://www.postgresql.org/download/
# Salve a senha do usuário 'postgres' (você vai usar depois!)
```

### 3. **Postman** (para testar API)

```bash
# Baixe em: https://www.postman.com/downloads/
# (Alternativas: Insomnia, Thunder Client, cURL)
```

### 4. **Visual Studio Code** (editor)

```bash
# Baixe em: https://code.visualstudio.com/
# Extensão recomendada: REST Client (para testar direto no VS Code)
```

---

## ⚙️ Setup Local

### Passo 1: Clonar o Repositório

```bash
# Se estiver no GitHub:
git clone https://github.com/seu-usuario/api-rastreadores.git
cd api-rastreadores

# Ou se estiver local:
cd c:\Users\Douglas\Desktop\api-rastreadores
```

### Passo 2: Instalar Dependências

```bash
# Instalar todos os pacotes (node_modules)
npm install

# Isso vai levar alguns minutos...
# Você verá outputs como:
# added 123 packages in 45s
```

### Passo 3: Criar Banco de Dados PostgreSQL

**No terminal/CMD:**

```bash
# Acessar PostgreSQL
psql -U postgres

# Você será pedido por senha (coloque a senha que salvou)
```

**Na prompt do PostgreSQL:**

```sql
-- Criar banco de dados
CREATE DATABASE api_rastreadores;

-- Verificar se foi criado
\l

-- Sair
\q
```

### Passo 4: Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar o arquivo .env com seus dados
# Abra em um editor (VS Code, Notepad, etc)
```

**Arquivo `.env` preenchido:**

```bash
# BANCO DE DADOS
DB_HOST=localhost
DB_PORT=5432
DB_NAME=api_rastreadores
DB_USER=postgres
DB_PASSWORD=sua_senha_postgres_aqui

# JWT
JWT_SECRET=uma_string_aleatoria_super_secreta_32_caracteres_minimo_abc123xyz
REFRESH_JWT_SECRET=outra_string_aleatoria_diferente_32_caracteres_minimo_xyz789abc

# SERVIDOR
PORT=3000
NODE_ENV=development
```

### Passo 5: Iniciar o Servidor

```bash
# Rodar em modo desenvolvimento (com auto-reload)
npm run dev

# Se funcionar, você verá algo como:
# ✅ Banco de dados conectado com sucesso!
# ✅ Tabelas sincronizadas com sucesso!
# 🔥 API rodando na porta 3000
```

🎉 **Pronto! API está rodando!**

---

## 📁 Estrutura do Projeto

### Visualização da Árvore

```
api-rastreadores/
│
├── src/                          # Código-fonte principal
│   ├── models/                  # Define estrutura dos dados
│   │   ├── user.js              # ← Usuário (Cliente)
│   │   ├── veiculo.js           # ← Veículo
│   │   ├── rastreador.js        # ← Rastreador GPS
│   │   └── chip.js              # ← Chip SIM
│   │
│   ├── repositories/            # Acesso a dados (IMPORTANTE!)
│   │   ├── userRepository.js
│   │   ├── veiculoRepository.js
│   │   ├── rastreadorRepository.js
│   │   └── chipRepository.js
│   │
│   ├── services/                # Lógica de negócio
│   │   └── authService.js       # ← Autenticação, JWT
│   │
│   ├── controllers/             # Orquestra requisições
│   │   ├── authController.js
│   │   ├── veiculoController.js
│   │   ├── rastreadorController.js
│   │   ├── chipController.js
│   │   ├── userController.js
│   │   └── dashboardController.js
│   │
│   ├── routes/                  # Define endpoints HTTP
│   │   ├── auth.js
│   │   ├── veiculos.js
│   │   ├── rastreadores.js
│   │   ├── chips.js
│   │   ├── users.js
│   │   ├── dashboard.js
│   │   └── index.js             # ← Centraliza todas rotas
│   │
│   ├── middlewares/             # Interceptadores
│   │   └── authMiddleware.js    # ← Valida JWT
│   │
│   ├── database/
│   │   └── index.js             # ← Conexão PostgreSQL
│   │
│   ├── app.js                   # ← Config Express (IMPORTANTE!)
│   └── server.js                # ← Inicia servidor
│
├── package.json                 # ← Dependências npm
├── .env.example                 # ← Template de variáveis
├── README.md                    # ← Documentação principal
├── EXEMPLOS-DE-USO.md           # ← Exemplos de requisições
└── SETUP.md                     # ← Este arquivo!
```

### O que Cada Camada Faz?

```
REQUEST HTTP
    ↓
MIDDLEWARE (verifyToken)
├─ Valida JWT
├─ Injeta req.user
    ↓
ROUTE (GET /veiculos)
├─ Indica qual controller usar
    ↓
CONTROLLER (veiculoController)
├─ Recebe requisição
├─ Valida dados
├─ Chama repository
├─ Retorna resposta JSON
    ↓
REPOSITORY (veiculoRepository)
├─ Acessa banco de dados
├─ Executa queries SQL
├─ Retorna dados
    ↓
MODEL (Veiculo)
├─ Define estrutura da tabela
├─ Define tipos de campos
├─ Define validações
    ↓
DATABASE (PostgreSQL)
├─ Armazena dados
├─ Executa SQL
    ↓
RESPONSE JSON
```

---

## 📚 Conceitos Fundamentais

### 1. **O que é MVC?**

**MVC = Model + View + Controller**

```javascript
// ❌ RUIM: Tudo junto (spaghetti code)
app.get("/veiculos", async (req, res) => {
  // Validação, banco, lógica, resposta tudo aqui!
  const veiculos = await db.query("SELECT * FROM veiculos");
  res.json(veiculos);
});

// ✅ BOM: Separado em camadas (MVC)
// controller.js
app.get("/veiculos", veiculoController.list); // Controller
// veiculoController.js
async list(req, res) {
  const veiculos = await veiculoRepository.findAll(); // Repository
  res.json(veiculos);
}
// repository.js
async findAll() {
  return await Veiculo.findAll(); // Model
}
// model.js
const Veiculo = sequelize.define("Veiculo", { ... });
```

### 2. **O que é Repository Pattern?**

Repository é uma **intermediária entre o código e o banco de dados**.

```javascript
// ❌ SEM Repository (ruim)
const users = await User.findAll(); // SQL direto no controller

// ✅ COM Repository (bom)
const users = await userRepository.findAll(); // Abstração
// userRepository.js
async findAll() {
  return await User.findAll(); // SQL aqui dentro
}
```

**Benefícios:**

- Código do controller fica limpo
- Fácil de testar (mock repository)
- Mudança no banco fica isolada

### 3. **O que é JWT (JSON Web Token)?**

JWT é um **formato padrão de token para autenticação web**.

```
TOKEN = header.payload.signature

Exemplo:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibG9naW4iOiJhZG1pbiJ9.xyz...

1. header: contém algoritmo (HS256)
2. payload: contém dados { id: 1, login: "admin" }
3. signature: hash assinado com secret (JWT_SECRET)

Cliente envia no header:
Authorization: Bearer <token>

Server valida assinatura com JWT_SECRET
Se alguém modificou, assinatura fica inválida ❌
```

### 4. **Por que Bcrypt?**

Bcrypt é para **criptografar senhas** (não reversível).

```javascript
// ❌ NUNCA (texto plano!)
password: "senha123"; // Fácil roubar no banco

// ✅ SEMPRE (bcrypt)
const hashed = await bcrypt.hash("senha123", 10);
// Result: $2b$10$9R8wvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv

// Para validar depois:
const match = await bcrypt.compare("senha123", hashed);
// true ✅ ou false ❌
```

### 5. **Relacionamentos SQL**

```javascript
// 1:N (um para muitos)
// Um usuário ( usuário tem MUITOS veículos
User.hasMany(Veiculo, { foreignKey: "userId" });

// N:1 (muitos para um)
// Muitos veículos pertencem a UM usuário
Veiculo.belongsTo(User, { foreignKey: "userId" });

// Usar em queries:
const user = await User.findByPk(1, {
  include: { association: "veiculos" },
});
// Result: { id, login, veiculos: [...] }
```

---

## 🧪 Testando a API

### Teste 1: Verificar se servidor está rodando

```bash
# Terminal (abra novo)
curl http://localhost:3000/api-health

# Ou no navegador:
http://localhost:3000/

# Resposta esperada: 404 (rota não existe, mas servidor está online ✅)
```

### Teste 2: Registrar usuário

**No Postman:**

```
Method: POST
URL: http://localhost:3000/auth/register
Headers:
  Content-Type: application/json

Body:
{
  "login": "teste@email.com",
  "password": "Senha123!",
  "ip": "192.168.1.1"
}

Response esperado (201):
{
  "message": "Usuário registrado com sucesso",
  "user": {
    "id": 1,
    "login": "teste@email.com",
    ...
  }
}
```

### Teste 3: Fazer login

```
Method: POST
URL: http://localhost:3000/auth/login
Body:
{
  "login": "teste@email.com",
  "password": "Senha123!"
}

Response (200):
{
  "access_token": "eyJhbGci...", ← SALVE ESTE TOKEN!
  "refresh_token": "eyJhbGci...",
  ...
}
```

### Teste 4: Usar token para acessar recurso protegido

```
Method: GET
URL: http://localhost:3000/dashboard/user
Headers:
  Authorization: Bearer eyJhbGci... ← Cole o access_token aqui!

Response (200):
{
  "user": { "id": 1, "login": "teste@email.com" },
  "summary": { ... },
  ...
}
```

✅ **Se chegou aqui, API está funcionando!**

---

## 🎓 Exercícios Práticos

### Exercício 1: Trace uma Requisição

```
Objetivo: Entender o fluxo completo

1. Abra Postman
2. POST /auth/login com seu usuário
3. Abra VS Code em: src/controllers/authController.js
4. Procure método login() e leia os comentários
5. Leia cada função chamada:
   - authService.login() (src/services/authService.js)
   - userRepository.findByLogin() (src/repositories/userRepository.js)
6. Abra banco de dados e veja dados criados
7. Confirme que entendeu o fluxo ✅
```

### Exercício 2: Criar Novo Endpoint

```
Objetivo: Adicionar funcionalidade

Tarefa: Criar rota GET /veiculos/placa/:placa

Passos:
1. Abra src/repositories/veiculoRepository.js
2. Veja que tem método findByPlaca() ✓
3. Abra src/controllers/veiculoController.js
4. Adicione novo método:
   async getByPlaca(req, res) {
     const { placa } = req.params;
     const veiculo = await veiculoRepository.findByPlaca(placa);
     if (!veiculo) return res.status(404).json({error: "Não encontrado"});
     return res.status(200).json({veiculo});
   }
5. Abra src/routes/veiculos.js
6. Adicione rota:
   router.get("/veiculos/placa/:placa",
     AuthMiddleware.verifyToken,
     veiculoController.getByPlaca.bind(veiculoController)
   );
7. Teste no Postman:
   GET http://localhost:3000/veiculos/placa/ABC1234
8. Confirme que funciona ✅
```

### Exercício 3: Adicionar Validação

```
Objetivo: Melhorar tratamento de erros

Tarefa: Adicionar validação de força de senha

Passos:
1. Abra src/services/authService.js
2. No método register(), após validar password.length
3. Adicione validação:
   if (!/[A-Z]/.test(password)) {
     throw new Error("Senha deve ter letra maiúscula");
   }
   if (!/[0-9]/.test(password)) {
     throw new Error("Senha deve ter número");
   }
   if (!/[!@#$%^&*]/.test(password)) {
     throw new Error("Senha deve ter caractere especial (!@#$%^&*)");
   }
4. Teste:
   - POST /auth/register com "senha123" (falha - sem maiúscula)
   - POST /auth/register com "Senha123!" (sucesso)
5. Confirme comportamento esperado ✅
```

### Exercício 4: Debug com Logs

```
Objetivo: Entender o que acontece durante execução

Passos:
1. Abra src/controllers/authController.js
2. No método login(), adicione logs:
   async login(req, res) {
     console.log("📝 Tentando fazer login...");
     const { login, password } = req.body;
     console.log("👤 Login recebido:", login);

     try {
       const result = await authService.login({ login, password });
       console.log("✅ Login bem-sucedido!");
       return res.status(200).json(result);
     } catch (error) {
       console.log("❌ Erro ao fazer login:", error.message);
       return res.status(401).json({error: error.message});
     }
   }
3. Rode npm run dev
4. Faça POST /auth/login
5. Veja os logs no terminal!
6. Entenda o que aconteceu step-by-step ✅
```

---

## 🚨 Troubleshooting

### Problema: "ENOTFOUND localhost:3000"

```bash
# Solução: Código não está rodando
# 1. Verifique se npm run dev está ativo
# 2. Veja se saiu algum erro no startup
# 3. Tente usar http://127.0.0.1:3000 em vez de localhost
```

### Problema: "connect ECONNREFUSED 127.0.0.1:5432"

```bash
# Solução: PostgreSQL não está rodando
# 1. Windows: Services → PostgreSQL → Start
# 2. Mac: brew services start postgresql
# 3. Linux: sudo service postgresql start
```

### Problema: "database does not exist"

```bash
# Solução: Banco não foi criado
# 1. psql -U postgres
# 2. CREATE DATABASE api_rastreadores;
# 3. \q
# 4. npm run dev (Sequelize vai criar tabelas)
```

### Problema: "jwt malformed" (token inválido)

```bash
# Solução: Token expirou ou se corrompido
# 1. Fazer login novamente para pegar novo token
# 2. POST /auth/login
# 3. Copiar novo access_token
# 4. Usar em requisições
```

---

## 📖 Próximos Passos

1. **Leia o README.md** - Documentação completa
2. **Estude EXEMPLOS-DE-USO.md** - Cópia/cola de requisições
3. **Explore o código** - Leia com atenção os comentários JSDoc
4. **Faça os exercícios** - Aprender fazendo!
5. **Modifique algo** - Adicione features novas
6. **Contribua** - Se achar erros, corrija!

---

## 🎯 Checklist de Aprendizado

- [ ] Consegui rodar o servidor localmente
- [ ] Fiz uma requisição de login e recebi token
- [ ] Entendo o que é MVC
- [ ] Entendo o que é Repository Pattern
- [ ] Consigo explicar como JWT funciona
- [ ] Consigo rastrear uma requisição do inicio ao fim
- [ ] Fiz exercício de criar novo endpoint
- [ ] Fiz exercício de adicionar validação
- [ ] Consigo ler e entender SQL simples
- [ ] Estou pronto para aprender mais! 🚀

---

## 📞 Dúvidas?

```javascript
// Lembre-se:
// 1. Ler código é aprender! Não tenha pressa
// 2. Comentários no código explicam tudo
// 3. Erros são oportunidade de aprender
// 4. Google é seu amigo (stack overflow, MDN)
// 5. Praticar muito é essencial!
```

**Happy Coding!** 🚀✨
