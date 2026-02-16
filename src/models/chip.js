/**
 * @file chip.js
 * @description Modelo de dados para chips de comunicação (SIM Cards)
 * Chips são usados em rastreadores para comunicação de dados
 * Um chip pode estar desassociado de um rastreador
 *
 * @requires sequelize - ORM para manipulação do banco de dados
 * @requires ../database/index.js - Instância de conexão Sequelize
 */

import { DataTypes } from "sequelize";
import sequelize from "../database/index.js";

/**
 * Define o modelo Chip
 * Representa um chip SIM ou de comunicação usado em rastreadores
 * Contém informações de operadora, linha e configurações de conexão
 */
const Chip = sequelize.define(
  "Chip",
  {
    // Campo ID: chave primária
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Campo iccid: Identificador único internacional do chip SIM
    // Tipicamente 20 dígitos numéricos
    iccid: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true, // ICCID deve ser único
      validate: {
        notEmpty: { msg: "ICCID é obrigatório" },
        isNumeric: { msg: "ICCID deve conter apenas números" },
      },
    },

    // Campo linha: número da linha/telefone do chip
    // Exemplo: 11999887766
    linha: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Linha é obrigatória" },
      },
    },

    // Campo operadora: nome da operadora de telecom (ex: Vivo, Claro, TIM)
    operadora: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Operadora é obrigatória" },
      },
    },

    // Campo apn: Access Point Name para conexão de dados
    // Exemplo: zap.vivo.com.br
    // Usado para configurar internet do chip
    apn: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "APN é obrigatório" },
      },
    },

    // Campo porta: porta de comunicação para o rastreador
    // Geralmente número entre 1 e 65535
    porta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "Porta deve ser um número inteiro" },
        min: [1, "Porta deve ser maior que 0"],
        max: [65535, "Porta deve ser menor que 65536"],
      },
    },

    // Campo rastreadorId: chave estrangeira para o rastreador
    // Um chip pode estar associado a um rastreador ou desassociado (allowNull: true)
    rastreadorId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Chip pode existir sem rastreador
      references: {
        model: "rastreadores",
        key: "id",
      },
      onDelete: "SET NULL", // Se rastreador for deletado, chip fica desassociado
    },

    // Campo ativo: indica se o chip está ativo e em operação
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
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
    tableName: "chips",
    timestamps: true,
  },
);

export default Chip;
