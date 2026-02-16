/**
 * @file app.js
 * @description Arquivo principal da aplicação Express
 * Configuração de middlewares, rotas e conexão com banco de dados
 *
 * @requires express - Framework web
 * @requires ./routes/index.js - Rotas da aplicação
 * @requires ./database/index.js - Conexão Sequelize
 * @requires ./models/* - Modelos de dados
 */

import express from "express";
import routes from "./routes/index.js";
import sequelize from "./database/index.js";

// Importar todos os modelos de dados
import User from "./models/user.js";
import Veiculo from "./models/veiculo.js";
import Rastreador from "./models/rastreador.js";
import Chip from "./models/chip.js";

// Criar instância do Express
const app = express();

/**
 * MIDDLEWARES GLOBAIS
 * Executados em TODAS as requisições
 */

// Middleware para parser JSON
// Converte o corpo da requisição (JSON) em objeto JavaScript
app.use(express.json());

// Rotas da aplicação
app.use(routes);

/**
 * DEFINIR RELACIONAMENTOS ENTRE MODELOS
 * Isso cria as chaves estrangeiras e relacionamentos no banco
 */

// Relacionamento: Um usuário tem muitos veículos
// Um-para-Muitos (1:N)
User.hasMany(Veiculo, {
  foreignKey: "userId", // Coluna na tabela veiculos
  as: "veiculos", // Alias para acessar: user.getVeiculos()
  onDelete: "CASCADE", // Se user for deletado, deleta seus veículos
});

// Relacionamento inverso: Um veículo pertence a um usuário
// Muitos-para-Um (N:1)
Veiculo.belongsTo(User, {
  foreignKey: "userId",
  as: "usuario",
});

// Relacionamento: Um veículo pode ter um rastreador
Veiculo.hasOne(Rastreador, {
  foreignKey: "veiculoId",
  as: "rastreador",
  onDelete: "SET NULL",
});

// Relacionamento inverso: Um rastreador pertence a um veículo
Rastreador.belongsTo(Veiculo, {
  foreignKey: "veiculoId",
  as: "veiculo",
});

// Relacionamento: Um rastreador pode ter um chip
Rastreador.hasOne(Chip, {
  foreignKey: "rastreadorId",
  as: "chip",
  onDelete: "SET NULL",
});

// Relacionamento inverso: Um chip pertence a um rastreador
Chip.belongsTo(Rastreador, {
  foreignKey: "rastreadorId",
  as: "rastreador",
});

/**
 * CONEXÃO COM BANCO DE DADOS
 * Autentica e sincroniza modelos com banco
 */

// Autenticar conexão com o banco PostgreSQL
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Banco de dados conectado com sucesso!");
  })
  .catch((error) => {
    console.error("❌ Erro ao conectar ao banco de dados:", error);
    process.exit(1); // Parar a aplicação se não conseguir conectar
  });

// Sincronizar modelos com o banco (criar tabelas se não existirem)
// { force: true } deleta e recria todas as tabelas (APENAS para desenvolvimento!)
// { alter: true } atualiza tabelas existentes
sequelize
  .sync({ force: true }) // Usar force: true para limpar e recricar tudo em desenvolvimento
  .then(() => {
    console.log("✅ Tabelas sincronizadas com sucesso!");
  })
  .catch((error) => {
    console.error("❌ Erro ao sincronizar tabelas:", error);
    process.exit(1);
  });

export default app;
