/**
 * @file user.js
 * @description Modelo de dados para usuários/clientes da plataforma
 * Define a estrutura da tabela 'users' no banco de dados PostgreSQL
 * Um usuário pode ter múltiplos veículos associados
 *
 * @requires sequelize - ORM para manipulação do banco de dados
 * @requires ../database/index.js - Instância de conexão Sequelize
 */

import { DataTypes } from "sequelize";
import sequelize from "../database/index.js";

/**
 * Define o modelo User (Usuário/Cliente)
 * Estrutura de um cliente que pode cadastrar veículos e rastreadores
 */
const User = sequelize.define(
  "User",
  {
    // Campo ID: chave primária, gerado automaticamente pelo Sequelize
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Campo login: nome de usuário único para acesso à plataforma
    login: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true, // Garante que não há dois usuários com o mesmo login
      validate: {
        notEmpty: { msg: "Login é obrigatório" },
        len: [3, 50], // Deve ter entre 3 e 50 caracteres
      },
    },

    // Campo password: senha criptografada com bcrypt (nunca armazenar em texto plano!)
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Senha é obrigatória" },
      },
    },

    // Campo ip: IP de registro ou último acesso registrado
    ip: {
      type: DataTypes.STRING(45), // Suporta IPv4 (15 caracteres) e IPv6 (39 caracteres)
      allowNull: true,
      field: "ip",
    },

    // Campo isAdmin: define se o usuário tem permissões de administrador
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Por padrão, novos usuários não são admin
      allowNull: false,
      field: "is_admin",
    },

    // Campo refreshTokenVersion: usado para invalidar tokens refresh antigos
    // Quando alterado, força o usuário a fazer login novamente
    refreshTokenVersion: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      field: "refresh_token_version",
    },

    // Campo createdAt: timestamp automático de quando o usuário foi criado
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
      field: "created_at",
    },

    // Campo updatedAt: timestamp automático de quando o usuário foi atualizado
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
      field: "updated_at",
    },
  },
  {
    tableName: "users", // Nome da tabela no banco de dados
    timestamps: true, // Ativa createdAt e updatedAt automáticos
    underscored: true, // Usa snake_case para nomes de colunas (created_at, updated_at)
  },
);

export default User;
