/**
 * @file chipController.js
 * @description Controller para operações CRUD de Chips SIM
 * Gerencia requisições HTTP para chips de comunicação
 *
 * @requires ../repositories/chipRepository.js - Acesso a dados
 */

import chipRepository from "../repositories/chipRepository.js";

/**
 * Classe ChipController
 * Métodos para tratamento de rotas
 */
class ChipController {
  /**
   * GET /chips
   * Lista todos os chips
   *
   * QUERY params (opcional):
   * - operadora: filtrar por operadora
   * - ativo: true/false para filtrar ativos
   *
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async list(req, res) {
    try {
      const { operadora } = req.query;

      let chips;

      if (operadora) {
        chips = await chipRepository.findByOperadora(operadora);
      } else {
        chips = await chipRepository.findAll();
      }

      return res.status(200).json({
        count: chips.length,
        chips,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
        code: "LIST_ERROR",
      });
    }
  }

  /**
   * GET /chips/:id
   * Busca chip específico
   *
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async getById(req, res) {
    try {
      const { id } = req.params;

      const chip = await chipRepository.findById(id);

      if (!chip) {
        return res.status(404).json({
          error: "Chip não encontrado",
          code: "NOT_FOUND",
        });
      }

      return res.status(200).json({
        chip,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
        code: "GET_ERROR",
      });
    }
  }

  /**
   * GET /chips/disponiveis
   * Lista chips sem rastreador associado
   *
   * Útil para seleção ao criar/editar rastreadores
   *
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async disponiveis(req, res) {
    try {
      const chips = await chipRepository.findDisponiveis();

      return res.status(200).json({
        count: chips.length,
        chips,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
        code: "LIST_ERROR",
      });
    }
  }

  /**
   * POST /chips
   * Cria novo chip
   *
   * BODY esperado:
   * {
   *   "iccid": "89551234567890123456",
   *   "linha": "11999887766",
   *   "operadora": "Vivo",
   *   "apn": "zap.vivo.com.br",
   *   "porta": 26959
   * }
   *
   * RESPOSTA (201):
   * {
   *   "message": "Chip criado com sucesso",
   *   "chip": { ... }
   * }
   *
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async create(req, res) {
    try {
      const { iccid, linha, operadora, apn, porta } = req.body;

      // Validação
      if (!iccid || !linha || !operadora || !apn || !porta) {
        return res.status(400).json({
          error: "ICCID, linha, operadora, APN e porta são obrigatórios",
          code: "VALIDATION_ERROR",
        });
      }

      const chip = await chipRepository.create({
        iccid,
        linha,
        operadora,
        apn,
        porta: parseInt(porta),
      });

      return res.status(201).json({
        message: "Chip criado com sucesso",
        chip,
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message,
        code: "CREATE_ERROR",
      });
    }
  }

  /**
   * PUT /chips/:id
   * Atualiza chip
   *
   * BODY esperado (todos opcionais):
   * {
   *   "iccid": "89551234567890123456",
   *   "linha": "11999887766",
   *   "operadora": "Vivo",
   *   "apn": "zap.vivo.com.br",
   *   "porta": 26959,
   *   "ativo": true
   * }
   *
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const chip = await chipRepository.findById(id);

      if (!chip) {
        return res.status(404).json({
          error: "Chip não encontrado",
          code: "NOT_FOUND",
        });
      }

      const updateData = { ...req.body };
      // Converter porta para int se fornecida
      if (updateData.porta) {
        updateData.porta = parseInt(updateData.porta);
      }

      const chipAtualizado = await chipRepository.update(id, updateData);

      return res.status(200).json({
        message: "Chip atualizado com sucesso",
        chip: chipAtualizado,
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message,
        code: "UPDATE_ERROR",
      });
    }
  }

  /**
   * DELETE /chips/:id
   * Deleta chip
   *
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const chip = await chipRepository.findById(id);

      if (!chip) {
        return res.status(404).json({
          error: "Chip não encontrado",
          code: "NOT_FOUND",
        });
      }

      await chipRepository.delete(id);

      return res.status(200).json({
        message: "Chip deletado com sucesso",
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
        code: "DELETE_ERROR",
      });
    }
  }

  /**
   * POST /chips/:id/rastreador/associar
   * Associa chip ao rastreador
   *
   * BODY esperado:
   * {
   *   "rastreadorId": 1
   * }
   *
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async associarRastreador(req, res) {
    try {
      const { id } = req.params;
      const { rastreadorId } = req.body;

      if (!rastreadorId) {
        return res.status(400).json({
          error: "rastreadorId é obrigatório",
          code: "VALIDATION_ERROR",
        });
      }

      const chip = await chipRepository.findById(id);

      if (!chip) {
        return res.status(404).json({
          error: "Chip não encontrado",
          code: "NOT_FOUND",
        });
      }

      const chipAtualizado = await chipRepository.associarRastreador(
        id,
        rastreadorId,
      );

      return res.status(200).json({
        message: "Rastreador associado com sucesso",
        chip: chipAtualizado,
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message,
        code: "ASSOCIATION_ERROR",
      });
    }
  }

  /**
   * POST /chips/:id/rastreador/desassociar
   * Desassocia rastreador
   *
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async desassociarRastreador(req, res) {
    try {
      const { id } = req.params;

      const chip = await chipRepository.findById(id);

      if (!chip) {
        return res.status(404).json({
          error: "Chip não encontrado",
          code: "NOT_FOUND",
        });
      }

      const chipAtualizado = await chipRepository.desassociarRastreador(id);

      return res.status(200).json({
        message: "Rastreador desassociado com sucesso",
        chip: chipAtualizado,
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message,
        code: "DISSOCIATION_ERROR",
      });
    }
  }
}

export default new ChipController();
