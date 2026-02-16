/**
 * @file rastreadorRepository.js
 * @description Repository para Rastreador
 * Centraliza lógica de acesso a dados de rastreadores
 *
 * @requires ../models/rastreador.js - Modelo Rastreador do Sequelize
 */

import Rastreador from "../models/rastreador.js";

/**
 * Classe RastreadorRepository
 * Métodos CRUD para rastreadores
 */
class RastreadorRepository {
  /**
   * Busca rastreador por ID com dados relacionados
   * Inclui veículo e chip associados
   *
   * @param {number} id - ID do rastreador
   * @returns {Promise<Rastreador|null>} Rastreador com dados relacionados
   */
  async findById(id) {
    try {
      const rastreador = await Rastreador.findByPk(id, {
        include: [
          {
            association: "veiculo",
            attributes: ["id", "placa", "modelo", "ano"],
          },
          {
            association: "chip",
            attributes: ["id", "iccid", "linha", "operadora", "apn", "porta"],
          },
        ],
      });
      return rastreador;
    } catch (error) {
      throw new Error(`Erro ao buscar rastreador: ${error.message}`);
    }
  }

  /**
   * Busca rastreador por IMEI (identificador único do dispositivo)
   *
   * @param {string} imei - IMEI do rastreador
   * @returns {Promise<Rastreador|null>} Rastreador encontrado
   */
  async findByImei(imei) {
    try {
      const rastreador = await Rastreador.findOne({
        where: { imei },
      });
      return rastreador;
    } catch (error) {
      throw new Error(`Erro ao buscar rastreador por IMEI: ${error.message}`);
    }
  }

  /**
   * Lista todos os rastreadores
   *
   * @returns {Promise<Rastreador[]>} Lista de rastreadores
   */
  async findAll() {
    try {
      const rastreadores = await Rastreador.findAll({
        include: [
          {
            association: "veiculo",
            attributes: ["id", "placa", "modelo"],
          },
          {
            association: "chip",
            attributes: ["id", "iccid", "linha"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      return rastreadores;
    } catch (error) {
      throw new Error(`Erro ao listar rastreadores: ${error.message}`);
    }
  }

  /**
   * Busca rastreadores inativos e não associados (disponíveis para uso)
   *
   * @returns {Promise<Rastreador[]>} Rastreadores disponíveis
   */
  async findDisponiveis() {
    try {
      const rastreadores = await Rastreador.findAll({
        where: {
          veiculoId: null, // Sem veículo
          ativo: true, // Ativo
        },
      });
      return rastreadores;
    } catch (error) {
      throw new Error(
        `Erro ao buscar rastreadores disponíveis: ${error.message}`,
      );
    }
  }

  /**
   * Cria novo rastreador
   *
   * @param {Object} rastreadorData - Dados do rastreador
   * @returns {Promise<Rastreador>} Rastreador criado
   */
  async create(rastreadorData) {
    try {
      // Validar IMEI duplicado
      const exists = await this.findByImei(rastreadorData.imei);
      if (exists) {
        throw new Error("IMEI já existe");
      }

      const rastreador = await Rastreador.create({
        imei: rastreadorData.imei,
        modelo: rastreadorData.modelo,
        protocolo: rastreadorData.protocolo || "GT06",
        plataforma: rastreadorData.plataforma || null,
        veiculoId: rastreadorData.veiculoId || null,
        chipId: rastreadorData.chipId || null,
        ativo: true,
      });
      return rastreador;
    } catch (error) {
      throw new Error(`Erro ao criar rastreador: ${error.message}`);
    }
  }

  /**
   * Atualiza dados de um rastreador
   *
   * @param {number} id - ID do rastreador
   * @param {Object} updateData - Dados a atualizar
   * @returns {Promise<Rastreador>} Rastreador atualizado
   */
  async update(id, updateData) {
    try {
      const rastreador = await Rastreador.findByPk(id);
      if (!rastreador) {
        throw new Error("Rastreador não encontrado");
      }

      // Validar IMEI se estiver sendo atualizado
      if (updateData.imei && updateData.imei !== rastreador.imei) {
        const exists = await this.findByImei(updateData.imei);
        if (exists) {
          throw new Error("IMEI já existe");
        }
      }

      await rastreador.update({
        imei: updateData.imei || rastreador.imei,
        modelo: updateData.modelo || rastreador.modelo,
        protocolo: updateData.protocolo || rastreador.protocolo,
        plataforma: updateData.plataforma || rastreador.plataforma,
        ativo:
          updateData.ativo !== undefined ? updateData.ativo : rastreador.ativo,
      });

      return rastreador;
    } catch (error) {
      throw new Error(`Erro ao atualizar rastreador: ${error.message}`);
    }
  }

  /**
   * Associa um veículo a um rastreador
   *
   * @param {number} rastreadorId - ID do rastreador
   * @param {number} veiculoId - ID do veículo
   * @returns {Promise<Rastreador>} Rastreador atualizado
   */
  async associarVeiculo(rastreadorId, veiculoId) {
    try {
      const rastreador = await Rastreador.findByPk(rastreadorId);
      if (!rastreador) {
        throw new Error("Rastreador não encontrado");
      }

      // Validar se veículo já tem outro rastreador
      const veiculoComRastreador = await Rastreador.findOne({
        where: { veiculoId },
      });
      if (veiculoComRastreador && veiculoComRastreador.id !== rastreadorId) {
        throw new Error("Este veículo já possui um rastreador");
      }

      await rastreador.update({ veiculoId });
      return rastreador;
    } catch (error) {
      throw new Error(`Erro ao associar veículo: ${error.message}`);
    }
  }

  /**
   * Desassocia um veículo de um rastreador
   *
   * @param {number} rastreadorId - ID do rastreador
   * @returns {Promise<Rastreador>} Rastreador atualizado
   */
  async desassociarVeiculo(rastreadorId) {
    try {
      const rastreador = await Rastreador.findByPk(rastreadorId);
      if (!rastreador) {
        throw new Error("Rastreador não encontrado");
      }

      await rastreador.update({ veiculoId: null });
      return rastreador;
    } catch (error) {
      throw new Error(`Erro ao desassociar veículo: ${error.message}`);
    }
  }

  /**
   * Associa um chip ao rastreador
   *
   * @param {number} rastreadorId - ID do rastreador
   * @param {number} chipId - ID do chip
   * @returns {Promise<Rastreador>} Rastreador atualizado
   */
  async associarChip(rastreadorId, chipId) {
    try {
      const rastreador = await Rastreador.findByPk(rastreadorId);
      if (!rastreador) {
        throw new Error("Rastreador não encontrado");
      }

      await rastreador.update({ chipId });
      return rastreador;
    } catch (error) {
      throw new Error(`Erro ao associar chip: ${error.message}`);
    }
  }

  /**
   * Desassocia um chip do rastreador
   *
   * @param {number} rastreadorId - ID do rastreador
   * @returns {Promise<Rastreador>} Rastreador atualizado
   */
  async desassociarChip(rastreadorId) {
    try {
      const rastreador = await Rastreador.findByPk(rastreadorId);
      if (!rastreador) {
        throw new Error("Rastreador não encontrado");
      }

      await rastreador.update({ chipId: null });
      return rastreador;
    } catch (error) {
      throw new Error(`Erro ao desassociar chip: ${error.message}`);
    }
  }

  /**
   * Deleta um rastreador
   * Desassocia automaticamente veículo e chip primeiro
   *
   * @param {number} id - ID do rastreador
   * @returns {Promise<boolean>} true se deletado
   */
  async delete(id) {
    try {
      const rastreador = await Rastreador.findByPk(id);
      if (!rastreador) {
        throw new Error("Rastreador não encontrado");
      }

      // Desassociar relacionamentos antes de deletar
      if (rastreador.veiculoId) {
        await rastreador.update({ veiculoId: null });
      }
      if (rastreador.chipId) {
        await rastreador.update({ chipId: null });
      }

      await rastreador.destroy();
      return true;
    } catch (error) {
      throw new Error(`Erro ao deletar rastreador: ${error.message}`);
    }
  }
}

export default new RastreadorRepository();
