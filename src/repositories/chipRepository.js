/**
 * @file chipRepository.js
 * @description Repository para Chip
 * Centraliza lógica de acesso a dados de chips SIM
 *
 * @requires ../models/chip.js - Modelo Chip do Sequelize
 */

import Chip from "../models/chip.js";

/**
 * Classe ChipRepository
 * Métodos CRUD para chips
 */
class ChipRepository {
  /**
   * Busca chip por ID com dados do rastreador associado
   *
   * @param {number} id - ID do chip
   * @returns {Promise<Chip|null>} Chip com dados relacionados
   */
  async findById(id) {
    try {
      const chip = await Chip.findByPk(id, {
        include: [
          {
            association: "rastreador",
            attributes: ["id", "imei", "modelo"],
          },
        ],
      });
      return chip;
    } catch (error) {
      throw new Error(`Erro ao buscar chip: ${error.message}`);
    }
  }

  /**
   * Busca chip por ICCID (identificador único do chip SIM)
   *
   * @param {string} iccid - ICCID do chip
   * @returns {Promise<Chip|null>} Chip encontrado
   */
  async findByIccid(iccid) {
    try {
      const chip = await Chip.findOne({
        where: { iccid },
      });
      return chip;
    } catch (error) {
      throw new Error(`Erro ao buscar chip por ICCID: ${error.message}`);
    }
  }

  /**
   * Busca chip por número de linha
   * Útil para validation e identificação
   *
   * @param {string} linha - Número da linha
   * @returns {Promise<Chip|null>} Chip encontrado
   */
  async findByLinha(linha) {
    try {
      const chip = await Chip.findOne({
        where: { linha },
      });
      return chip;
    } catch (error) {
      throw new Error(`Erro ao buscar chip por linha: ${error.message}`);
    }
  }

  /**
   * Lista todos os chips
   *
   * @returns {Promise<Chip[]>} Lista de chips
   */
  async findAll() {
    try {
      const chips = await Chip.findAll({
        include: [
          {
            association: "rastreador",
            attributes: ["id", "imei", "modelo"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      return chips;
    } catch (error) {
      throw new Error(`Erro ao listar chips: ${error.message}`);
    }
  }

  /**
   * Busca chips disponíveis (sem rastreador associado)
   *
   * @returns {Promise<Chip[]>} Chips desassociados
   */
  async findDisponiveis() {
    try {
      const chips = await Chip.findAll({
        where: {
          rastreadorId: null, // Sem rastreador
          ativo: true, // Ativo
        },
      });
      return chips;
    } catch (error) {
      throw new Error(`Erro ao buscar chips disponíveis: ${error.message}`);
    }
  }

  /**
   * Busca chips de uma operadora específica
   *
   * @param {string} operadora - Nome da operadora
   * @returns {Promise<Chip[]>} Chips da operadora
   */
  async findByOperadora(operadora) {
    try {
      const chips = await Chip.findAll({
        where: { operadora },
        order: [["createdAt", "DESC"]],
      });
      return chips;
    } catch (error) {
      throw new Error(`Erro ao buscar chips da operadora: ${error.message}`);
    }
  }

  /**
   * Cria novo chip
   *
   * @param {Object} chipData - Dados do chip
   * @returns {Promise<Chip>} Chip criado
   */
  async create(chipData) {
    try {
      // Validar ICCID duplicado
      const iccidExists = await this.findByIccid(chipData.iccid);
      if (iccidExists) {
        throw new Error("ICCID já existe");
      }

      // Validar linha duplicada
      const linhaExists = await this.findByLinha(chipData.linha);
      if (linhaExists) {
        throw new Error("Linha já existe");
      }

      const chip = await Chip.create({
        iccid: chipData.iccid,
        linha: chipData.linha,
        operadora: chipData.operadora,
        apn: chipData.apn,
        porta: chipData.porta,
        rastreadorId: chipData.rastreadorId || null,
        ativo: true,
      });
      return chip;
    } catch (error) {
      throw new Error(`Erro ao criar chip: ${error.message}`);
    }
  }

  /**
   * Atualiza dados de um chip
   *
   * @param {number} id - ID do chip
   * @param {Object} updateData - Dados a atualizar
   * @returns {Promise<Chip>} Chip atualizado
   */
  async update(id, updateData) {
    try {
      const chip = await Chip.findByPk(id);
      if (!chip) {
        throw new Error("Chip não encontrado");
      }

      // Validar ICCID se estiver sendo atualizado
      if (updateData.iccid && updateData.iccid !== chip.iccid) {
        const exists = await this.findByIccid(updateData.iccid);
        if (exists) {
          throw new Error("ICCID já existe");
        }
      }

      // Validar linha se estiver sendo atualizada
      if (updateData.linha && updateData.linha !== chip.linha) {
        const exists = await this.findByLinha(updateData.linha);
        if (exists) {
          throw new Error("Linha já existe");
        }
      }

      await chip.update({
        iccid: updateData.iccid || chip.iccid,
        linha: updateData.linha || chip.linha,
        operadora: updateData.operadora || chip.operadora,
        apn: updateData.apn || chip.apn,
        porta: updateData.porta || chip.porta,
        ativo: updateData.ativo !== undefined ? updateData.ativo : chip.ativo,
      });

      return chip;
    } catch (error) {
      throw new Error(`Erro ao atualizar chip: ${error.message}`);
    }
  }

  /**
   * Associa um chip ao rastreador
   * Nota: O rastreador não pode ter dois chips
   *
   * @param {number} chipId - ID do chip
   * @param {number} rastreadorId - ID do rastreador
   * @returns {Promise<Chip>} Chip atualizado
   */
  async associarRastreador(chipId, rastreadorId) {
    try {
      const chip = await Chip.findByPk(chipId);
      if (!chip) {
        throw new Error("Chip não encontrado");
      }

      // Validar se rastreador já tem chip
      const rastreadorComChip = await Chip.findOne({
        where: { rastreadorId },
      });
      if (rastreadorComChip && rastreadorComChip.id !== chipId) {
        throw new Error("Este rastreador já possui um chip");
      }

      await chip.update({ rastreadorId });
      return chip;
    } catch (error) {
      throw new Error(`Erro ao associar rastreador: ${error.message}`);
    }
  }

  /**
   * Desassocia um chip de um rastreador
   *
   * @param {number} chipId - ID do chip
   * @returns {Promise<Chip>} Chip atualizado
   */
  async desassociarRastreador(chipId) {
    try {
      const chip = await Chip.findByPk(chipId);
      if (!chip) {
        throw new Error("Chip não encontrado");
      }

      await chip.update({ rastreadorId: null });
      return chip;
    } catch (error) {
      throw new Error(`Erro ao desassociar rastreador: ${error.message}`);
    }
  }

  /**
   * Deleta um chip
   * Desassocia automaticamente do rastreador antes de deletar
   *
   * @param {number} id - ID do chip
   * @returns {Promise<boolean>} true se deletado
   */
  async delete(id) {
    try {
      const chip = await Chip.findByPk(id);
      if (!chip) {
        throw new Error("Chip não encontrado");
      }

      // Desassociar antes de deletar
      if (chip.rastreadorId) {
        await chip.update({ rastreadorId: null });
      }

      await chip.destroy();
      return true;
    } catch (error) {
      throw new Error(`Erro ao deletar chip: ${error.message}`);
    }
  }
}

export default new ChipRepository();
