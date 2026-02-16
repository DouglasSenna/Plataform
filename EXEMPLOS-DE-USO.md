/\*\*

- @file EXEMPLOS-DE-USO.md
- @description Exemplos práticos de como usar a API
-
- Copie e cole estes exemplos no Postman ou similar
  \*/

# EXEMPLOS PRÁTICOS DE USO DA API

## 1️⃣ AUTENTICAÇÃO

### Registrar Novo Usuário

```http
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "login": "admin@rastreadores.com",
  "password": "SenhaForte123!",
  "ip": "192.168.1.100"
}
```

**Resposta (201):**

```json
{
  "message": "Usuário registrado com sucesso",
  "user": {
    "id": 1,
    "login": "admin@rastreadores.com",
    "ip": "192.168.1.100",
    "createdAt": "2026-02-16T10:00:00.000Z"
  }
}
```

### Fazer Login

```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "login": "admin@rastreadores.com",
  "password": "SenhaForte123!",
  "ip": "192.168.1.100"
}
```

**Resposta (200):**

```json
{
  "message": "Login realizado com sucesso",
  "user": {
    "id": 1,
    "login": "admin@rastreadores.com"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibG9naW4iOiJhZG1pbkByYXN0cmVhZG9yZXMuY29tIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTY0OTYyNDQwMCwiZXhwIjoxNjQ5NjI1MjAwfQ.xyz...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwi...",
  "expiresIn": "15m"
}
```

⚠️ **IMPORTANTE**: Salve o `access_token` e `refresh_token` para usar em requisições futuras!

### Renovar Token (quando expirar)

```http
POST http://localhost:3000/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwi..."
}
```

**Resposta (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.novo_token...",
  "expiresIn": "15m"
}
```

### Fazer Logout

```http
POST http://localhost:3000/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwi...
```

**Resposta (200):**

```json
{
  "message": "Logout realizado com sucesso"
}
```

---

## 2️⃣ VEÍCULOS

### Criar Veículo

```http
POST http://localhost:3000/veiculos
Authorization: Bearer <seu_access_token>
Content-Type: application/json

{
  "placa": "ABC1234",
  "modelo": "Honda Civic 2023",
  "ano": 2023,
  "cor": "Preto"
}
```

**Resposta (201):**

```json
{
  "message": "Veículo criado com sucesso",
  "veiculo": {
    "id": 1,
    "userId": 1,
    "placa": "ABC1234",
    "modelo": "Honda Civic 2023",
    "ano": 2023,
    "cor": "Preto",
    "rastreadorId": null,
    "createdAt": "2026-02-16T10:05:00.000Z",
    "updatedAt": "2026-02-16T10:05:00.000Z"
  }
}
```

### Listar Meus Veículos

```http
GET http://localhost:3000/veiculos
Authorization: Bearer <seu_access_token>
```

**Resposta (200):**

```json
{
  "count": 2,
  "veiculos": [
    {
      "id": 1,
      "placa": "ABC1234",
      "modelo": "Honda Civic",
      "ano": 2023,
      "rastreador": null
    },
    {
      "id": 2,
      "placa": "DEF5678",
      "modelo": "Toyota Corolla",
      "ano": 2022,
      "rastreador": {
        "id": 1,
        "imei": "355234567890123",
        "modelo": "TK103",
        "ativo": true
      }
    }
  ]
}
```

### Buscar Veículo Específico

```http
GET http://localhost:3000/veiculos/1
Authorization: Bearer <seu_access_token>
```

**Resposta (200):**

```json
{
  "veiculo": {
    "id": 1,
    "placa": "ABC1234",
    "modelo": "Honda Civic",
    "ano": 2023,
    "cor": "Preto",
    "usuario": {
      "id": 1,
      "login": "admin@rastreadores.com"
    },
    "rastreador": null,
    "createdAt": "2026-02-16T10:05:00.000Z"
  }
}
```

### Atualizar Veículo

```http
PUT http://localhost:3000/veiculos/1
Authorization: Bearer <seu_access_token>
Content-Type: application/json

{
  "modelo": "Honda Civic 2024",
  "cor": "Branco"
}
```

### Deletar Veículo

```http
DELETE http://localhost:3000/veiculos/1
Authorization: Bearer <seu_access_token>
```

### Associar Rastreador a Veículo

```http
POST http://localhost:3000/veiculos/1/rastreador/associar
Authorization: Bearer <seu_access_token>
Content-Type: application/json

{
  "rastreadorId": 5
}
```

### Desassociar Rastreador

```http
POST http://localhost:3000/veiculos/1/rastreador/desassociar
Authorization: Bearer <seu_access_token>
```

---

## 3️⃣ RASTREADORES (Admin Only)

⚠️ **Nota**: Rastreadores só podem ser criados/editados por admins

### Criar Rastreador

```http
POST http://localhost:3000/rastreadores
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "imei": "355234567890123",
  "modelo": "TK103",
  "protocolo": "GT06",
  "plataforma": "TK Server"
}
```

**Resposta (201):**

```json
{
  "message": "Rastreador criado com sucesso",
  "rastreador": {
    "id": 5,
    "imei": "355234567890123",
    "modelo": "TK103",
    "protocolo": "GT06",
    "plataforma": "TK Server",
    "veiculoId": null,
    "chipId": null,
    "ativo": true,
    "createdAt": "2026-02-16T10:10:00.000Z"
  }
}
```

### Listar Rastreadores Disponíveis

```http
GET http://localhost:3000/rastreadores/disponíveis
Authorization: Bearer <admin_access_token>
```

**Resposta (200):**

```json
{
  "count": 2,
  "rastreadores": [
    {
      "id": 5,
      "imei": "355234567890123",
      "modelo": "TK103",
      "veiculoId": null,
      "chipId": null
    }
  ]
}
```

### Associar Chip ao Rastreador

```http
POST http://localhost:3000/rastreadores/5/chip/associar
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "chipId": 3
}
```

---

## 4️⃣ CHIPS (Admin Only)

### Criar Chip

```http
POST http://localhost:3000/chips
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "iccid": "89551234567890123456",
  "linha": "11999887766",
  "operadora": "Vivo",
  "apn": "zap.vivo.com.br",
  "porta": 26959
}
```

**Resposta (201):**

```json
{
  "message": "Chip criado com sucesso",
  "chip": {
    "id": 3,
    "iccid": "89551234567890123456",
    "linha": "11999887766",
    "operadora": "Vivo",
    "apn": "zap.vivo.com.br",
    "porta": 26959,
    "rastreadorId": null,
    "ativo": true,
    "createdAt": "2026-02-16T10:15:00.000Z"
  }
}
```

### Listar Chips Disponíveis

```http
GET http://localhost:3000/chips/disponíveis
Authorization: Bearer <admin_access_token>
```

### Listar Chips por Operadora

```http
GET http://localhost:3000/chips?operadora=Vivo
Authorization: Bearer <admin_access_token>
```

---

## 5️⃣ USUÁRIOS (Admin Only)

### Listar Todos os Usuários

```http
GET http://localhost:3000/users
Authorization: Bearer <admin_access_token>
```

**Resposta (200):**

```json
{
  "count": 3,
  "users": [
    {
      "id": 1,
      "login": "admin@rastreadores.com",
      "ip": "192.168.1.100",
      "isAdmin": true,
      "createdAt": "2026-02-16T10:00:00.000Z"
    },
    {
      "id": 2,
      "login": "usuario@rastreadores.com",
      "ip": "192.168.1.101",
      "isAdmin": false,
      "createdAt": "2026-02-16T10:02:00.000Z"
    }
  ]
}
```

### Buscar Usuário com Seus Veículos

```http
GET http://localhost:3000/users/2
Authorization: Bearer <admin_access_token>
```

### Dar Permissão de Admin

```http
PATCH http://localhost:3000/users/2/admin
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "isAdmin": true
}
```

### Remover Permissão de Admin

```http
PATCH http://localhost:3000/users/2/admin
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "isAdmin": false
}
```

### Deletar Usuário

```http
DELETE http://localhost:3000/users/2
Authorization: Bearer <admin_access_token>
```

⚠️ **Isso deleta o usuário e TODOS seus veículos em cascata!**

---

## 6️⃣ DASHBOARD

### Dashboard do Usuário Logado

```http
GET http://localhost:3000/dashboard/user
Authorization: Bearer <seu_access_token>
```

**Resposta (200):**

```json
{
  "user": {
    "id": 1,
    "login": "admin@rastreadores.com"
  },
  "summary": {
    "totalVeiculos": 2,
    "totalRastreadores": 1,
    "totalChips": 1,
    "veiculosSemRastreador": 1
  },
  "veiculos": [
    {
      "id": 1,
      "placa": "ABC1234",
      "modelo": "Honda Civic",
      "ano": 2023,
      "rastreador": null
    },
    {
      "id": 2,
      "placa": "DEF5678",
      "modelo": "Toyota Corolla",
      "year": 2022,
      "rastreador": {
        "id": 1,
        "imei": "355234567890123",
        "modelo": "TK103",
        "ativo": true
      }
    }
  ],
  "rastreadores": [...],
  "chips": [...]
}
```

### Dashboard Geral (Admin Only)

```http
GET http://localhost:3000/dashboard
Authorization: Bearer <admin_access_token>
```

**Resposta (200):**

```json
{
  "summary": {
    "totalUsers": 3,
    "totalVeiculos": 5,
    "totalRastreadores": 4,
    "totalChips": 5,
    "rastreadoresAtivos": 3,
    "rastreadoresDisponiveis": 1,
    "chipsDisponiveis": 2
  },
  "veiculosSemRastreador": [...],
  "rastreadoresDisponiveis": [...],
  "chipsDisponiveis": [...]
}
```

---

## 🧪 Fluxo Completo (Passo a Passo)

### 1. Criar usuário admin

```bash
POST /auth/register
{ "login": "admin@teste.com", "password": "admin123" }
```

Salve o ID da resposta (ex: 1)

### 2. Criar usuário cliente

```bash
POST /auth/register
{ "login": "cliente@teste.com", "password": "cliente123" }
```

Salve o ID (ex: 2)

### 3. Dar permissão de admin ao usuário 1

```bash
PATCH /users/1/admin
Authorization: <admin_token>
{ "isAdmin": true }
```

### 4. Criar veículo para cliente

```bash
POST /veiculos
Authorization: <cliente_token>
{ "placa": "ABC1234", "modelo": "Honda", "ano": 2023 }
```

Salve o ID do veículo (ex: 1)

### 5. Criar rastreador (como admin)

```bash
POST /rastreadores
Authorization: <admin_token>
{ "imei": "355234567890123", "modelo": "TK103" }
```

Salve o ID do rastreador (ex: 5)

### 6. Associar rastreador ao veículo

```bash
POST /veiculos/1/rastreador/associar
Authorization: <cliente_token>
{ "rastreadorId": 5 }
```

### 7. Criar chip (como admin)

```bash
POST /chips
Authorization: <admin_token>
{ "iccid": "89551234567890123456", "linha": "11999887766", ... }
```

Salve o ID do chip (ex: 3)

### 8. Associar chip ao rastreador

```bash
POST /rastreadores/5/chip/associar
Authorization: <admin_token>
{ "chipId": 3 }
```

### 9. Ver dashboard do cliente

```bash
GET /dashboard/user
Authorization: <cliente_token>
```

✅ Agora o cliente tem:

- 1 veículo (ABC1234)
- 1 rastreador associado (355234567890123)
- 1 chip associado (89551234567890123456)

---

## 🚨 Erros Comuns e Soluções

| Erro                    | Causa                         | Solução                                  |
| ----------------------- | ----------------------------- | ---------------------------------------- |
| 401 Token não fornecido | Header Authorization faltando | Adicione `Authorization: Bearer <token>` |
| 401 Token expirado      | Access token passou 15 min    | Use refresh token para renovar           |
| 403 Permissão negada    | Não é admin                   | Faça login como admin ou peça upgrade    |
| 404 Não encontrado      | ID não existe                 | Verifique o ID no banco                  |
| 400 Placa já existe     | Placa duplicada               | Use outra placa                          |
| 400 IMEI já existe      | IMEI duplicado                | Use outro IMEI                           |

---

## 📝 Dicas

1. Sempre salve tokens em variáveis do Postman
2. Use environment variables para reutilizar URLs e tokens
3. Teste no modo "production" de erros (NODE_ENV=test)
4. Verifique logs do servidor para entender o que aconteceu
5. Use console.log nos controllers para debug

**Happy testing!** 🚀
