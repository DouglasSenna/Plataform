/**
 * @file rastreador.js
 * @description Modelo de dados para rastreadores GPS
 * Um rastreador é um dispositivo físico que pode ser associado a um veículo e um chip
 *
 * @requires sequelize - ORM para manipulação do banco de dados
 * @requires ../database/index.js - Instância de conexão Sequelize
 */

import { DataTypes } from "sequelize";
import sequelize from "../database/index.js";

/**
 * Define o modelo Rastreador
 * Representa um dispositivo de rastreamento GPS que pode ser instalado em um veículo
 * O rastreador pode estar associado a um veículo e opcionalmente a um chip
 */
const Rastreador = sequelize.define(
  "Rastreador",
  {
    // Campo ID: chave primária
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Campo imei: Identificador único internacional do equipamento
    // Tipicamente 15 dígitos numéricos
    // Usado para identificar o dispositivo no sistema
    imei: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true, // IMEI é único, não pode haver dois rastreadores com o mesmo IMEI
      validate: {
        notEmpty: { msg: "IMEI é obrigatório" },
        isNumeric: { msg: "IMEI deve conter apenas números" },
        len: [15, 15], // IMEI tem exatamente 15 dígitos
      },
    },

    // Campo modelo: modelo do rastreador (ex: TK103, TK110, Concox)
    modelo: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        notEmpty: { msg: "Modelo é obrigatório" },
      },
    },

    // Campo protocolo: protocolo de comunicação usado (ex: GT06, T4H, Concox)
    protocolo: {
      type: DataTypes.STRING(50),
      defaultValue: "GT06",
      validate: {
        notEmpty: { msg: "Protocolo é obrigatório" },
      },
    },

    // Campo veiculo: chave estrangeira que referencia um veículo
    // Um rastreador pode estar sem um veículo associado (allowNull: true)
    veiculoId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Rastreador pode existir sem ser instalado em um veículo
      references: {
        model: "veiculos",
        key: "id",
      },
      onDelete: "SET NULL", // Se veículo for deletado, rastreador apenas desassocia
    },

    // Campo chipId: chave estrangeira que referencia um chip
    // Um rastreador pode estar sem um chip associado (allowNull: true)
    chipId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Rastreador pode existir sem chip
      references: {
        model: "chips",
        key: "id",
      },
      onDelete: "SET NULL", // Se chip for deletado, rastreador apenas desassocia
    },

    // Campo plataforma: plataforma de rastreamento (ex: TK Server, Concox Cloud)
    plataforma: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    // Campo ativo: indica se o rastreador está em operação
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
    tableName: "rastreadores",
    timestamps: true,
  },
);

export default Rastreador;
