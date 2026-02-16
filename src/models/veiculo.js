/**
 * @file veiculo.js
 * @description Modelo de dados para veículos da plataforma
 * Um veículo pertence a um usuário e pode ter um rastreador associado
 *
 * @requires sequelize - ORM para manipulação do banco de dados
 * @requires ../database/index.js - Instância de conexão Sequelize
 */

import { DataTypes } from "sequelize";
import sequelize from "../database/index.js";

/**
 * Define o modelo Veiculo (Veículo)
 * Represents a vehicle in the system that belongs to a user
 * Uma forma de organizar múltiplos veículos por cliente
 */
const Veiculo = sequelize.define(
  "Veiculo",
  {
    // Campo ID: chave primária
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Campo userId: chave estrangeira que referencia a tabela de usuários
    // Indica qual usuário/cliente é dono deste veículo
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // Nome da tabela referenciada
        key: "id", // Coluna da tabela referenciada
      },
      onDelete: "CASCADE", // Se user for deletado, deleta seus veículos também
      validate: {
        notEmpty: { msg: "usuário é obrigatório" },
      },
    },

    // Campo placa: placa do veículo (ex: ABC-1234)
    placa: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true, // Placa é única na plataforma
      validate: {
        notEmpty: { msg: "Placa é obrigatória" },
        isUppercase: { msg: "A placa deve estar em maiúsculas" },
      },
    },

    // Campo modelo: modelo/nome do veículo (ex: Honda Civic 2023)
    modelo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Modelo é obrigatório" },
      },
    },

    // Campo ano: ano de fabricação do veículo
    ano: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "Ano deve ser um número inteiro" },
        min: [1900, "Ano deve ser maior que 1900"],
        max: [new Date().getFullYear() + 1, "Ano não pode ser no futuro"],
      },
    },

    // Campo cor: cor do veículo (útil para identificação visual)
    cor: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },

    // Campo rastreadorId: chave estrangeira que referencia o rastreador
    // Um veículo pode ficar sem rastreador (allowNull: true)
    rastreadorId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Veículo pode existir sem rastreador
      references: {
        model: "rastreadores",
        key: "id",
      },
      onDelete: "SET NULL", // Se rastreador for deletado, apenas desassocia
    },

    // Campo createdAt: timestamp de criação (automático)
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },

    // Campo updatedAt: timestamp de atualização (automático)
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    tableName: "veiculos",
    timestamps: true,
  },
);

export default Veiculo;
