/**
 * @file veiculoRepository.js
 * @description Repository para Veiculo
 * Centraliza lógica de acesso a dados de veículos
 *
 * @requires ../models/veiculo.js - Modelo Veiculo do Sequelize
 */

import Veiculo from "../models/veiculo.js";

/**
 * Classe VeiculoRepository
 * Métodos CRUD para veículos
 */
class VeiculoRepository {
  /**
   * Busca veículo por ID com todos os dados relacionados
   * Inclui usuario, rastreador e o chip do rastreador
   *
   * @param {number} id - ID do veículo
   * @returns {Promise<Veiculo|null>} Veículo com dados relacionados
   */
  async findById(id) {
    try {
      const veiculo = await Veiculo.findByPk(id, {
        include: [
          {
            association: "usuario",
            attributes: ["id", "login"],
          },
          {
            association: "rastreador",
            attributes: ["id", "imei", "modelo", "protocolo", "ativo"],
            include: [
              {
                association: "chip",
                attributes: [
                  "id",
                  "iccid",
                  "linha",
                  "operadora",
                  "apn",
                  "porta",
                  "ativo",
                ],
              },
            ],
          },
        ],
      });
      return veiculo;
    } catch (error) {
      throw new Error(`Erro ao buscar veículo: ${error.message}`);
    }
  }

  /**
   * Busca veículo por placa
   * Útil para validar duplicatas e consultas por identificador visual
   *
   * @param {string} placa - Placa do veículo
   * @returns {Promise<Veiculo|null>} Veículo encontrado
   */
  async findByPlaca(placa) {
    try {
      const veiculo = await Veiculo.findOne({
        where: { placa: placa.toUpperCase() }, // Normalizar para maiúsculas
      });
      return veiculo;
    } catch (error) {
      throw new Error(`Erro ao buscar veículo por placa: ${error.message}`);
    }
  }

  /**
   * Busca todos os veículos de um usuário
   * Útil para exibir lista de veículos no dashboard
   *
   * @param {number} userId - ID do usuário
   * @returns {Promise<Veiculo[]>} Lista de veículos
   */
  async findByUserId(userId) {
    try {
      const veiculos = await Veiculo.findAll({
        where: { userId },
        include: [
          {
            association: "rastreador",
            attributes: ["id", "imei", "modelo", "ativo"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      return veiculos;
    } catch (error) {
      throw new Error(`Erro ao buscar veículos do usuário: ${error.message}`);
    }
  }

  /**
   * Lista todos os veículos da plataforma (para admin)
   *
   * @returns {Promise<Veiculo[]>} Lista de todos os veículos
   */
  async findAll() {
    try {
      const veiculos = await Veiculo.findAll({
        include: [
          {
            association: "usuario",
            attributes: ["id", "login"],
          },
          {
            association: "rastreador",
            attributes: ["id", "imei"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      return veiculos;
    } catch (error) {
      throw new Error(`Erro ao listar veículos: ${error.message}`);
    }
  }

  /**
   * Cria novo veículo
   *
   * @param {number} userId - ID do usuário/cliente
   * @param {Object} veiculoData - Dados do veículo
   * @returns {Promise<Veiculo>} Veículo criado
   */
  async create(userId, veiculoData) {
    try {
      // Validação de placa duplicada
      const exists = await this.findByPlaca(veiculoData.placa);
      if (exists) {
        throw new Error("Placa já existe");
      }

      const veiculo = await Veiculo.create({
        userId,
        placa: veiculoData.placa.toUpperCase(),
        modelo: veiculoData.modelo,
        ano: veiculoData.ano,
        cor: veiculoData.cor || null,
      });
      return veiculo;
    } catch (error) {
      throw new Error(`Erro ao criar veículo: ${error.message}`);
    }
  }

  /**
   * Atualiza dados de um veículo
   *
   * @param {number} id - ID do veículo
   * @param {Object} updateData - Dados a atualizar
   * @returns {Promise<Veiculo>} Veículo atualizado
   */
  async update(id, updateData) {
    try {
      const veiculo = await Veiculo.findByPk(id);
      if (!veiculo) {
        throw new Error("Veículo não encontrado");
      }

      // Validar placa se estiver sendo atualizada
      if (updateData.placa && updateData.placa !== veiculo.placa) {
        const exists = await this.findByPlaca(updateData.placa);
        if (exists) {
          throw new Error("Placa já existe");
        }
      }

      await veiculo.update({
        placa: updateData.placa
          ? updateData.placa.toUpperCase()
          : veiculo.placa,
        modelo: updateData.modelo || veiculo.modelo,
        ano: updateData.ano || veiculo.ano,
        cor: updateData.cor || veiculo.cor,
      });

      return veiculo;
    } catch (error) {
      throw new Error(`Erro ao atualizar veículo: ${error.message}`);
    }
  }

  /**
   * Associa um rastreador a um veículo
   *
   * @param {number} veiculoId - ID do veículo
   * @param {number} rastreadorId - ID do rastreador
   * @returns {Promise<Veiculo>} Veículo atualizado
   */
  async associarRastreador(veiculoId, rastreadorId) {
    try {
      const veiculo = await Veiculo.findByPk(veiculoId);
      if (!veiculo) {
        throw new Error("Veículo não encontrado");
      }

      await veiculo.update({ rastreadorId });
      return veiculo;
    } catch (error) {
      throw new Error(`Erro ao associar rastreador: ${error.message}`);
    }
  }

  /**
   * Desassocia um rastreador de um veículo
   *
   * @param {number} veiculoId - ID do veículo
   * @returns {Promise<Veiculo>} Veículo desassociado
   */
  async desassociarRastreador(veiculoId) {
    try {
      const veiculo = await Veiculo.findByPk(veiculoId);
      if (!veiculo) {
        throw new Error("Veículo não encontrado");
      }

      await veiculo.update({ rastreadorId: null });
      return veiculo;
    } catch (error) {
      throw new Error(`Erro ao desassociar rastreador: ${error.message}`);
    }
  }

  /**
   * Deleta um veículo
   *
   * @param {number} id - ID do veículo
   * @returns {Promise<boolean>} true se deletado
   */
  async delete(id) {
    try {
      const veiculo = await Veiculo.findByPk(id);
      if (!veiculo) {
        throw new Error("Veículo não encontrado");
      }

      // Se tem rastreador, desassocia primeiro
      if (veiculo.rastreadorId) {
        await veiculo.update({ rastreadorId: null });
      }

      await veiculo.destroy();
      return true;
    } catch (error) {
      throw new Error(`Erro ao deletar veículo: ${error.message}`);
    }
  }
}

export default new VeiculoRepository();
