/**
 * @file rastreadorController.js
 * @description Controller para operações CRUD de Rastreadores
 * Gerencia requisições HTTP para rastreadores GPS
 *
 * @requires ../repositories/rastreadorRepository.js - Acesso a dados
 */

import rastreadorRepository from "../repositories/rastreadorRepository.js";

/**
 * Classe RastreadorController
 * Métodos para tratamento de rotas
 */
class RastreadorController {
  /**
   * GET /rastreadores
   * Lista todos os rastreadores
   *
   * RESPOSTA (200):
   * {
   *   "count": 5,
   *   "rastreadores": [ ... ]
   * }
   *
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async list(req, res) {
    try {
      const rastreadores = await rastreadorRepository.findAll();

      return res.status(200).json({
        count: rastreadores.length,
        rastreadores,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
        code: "LIST_ERROR",
      });
    }
  }

  /**
   * GET /rastreadores/:id
   * Busca rastreador específico
   *
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async getById(req, res) {
    try {
      const { id } = req.params;

      const rastreador = await rastreadorRepository.findById(id);

      if (!rastreador) {
        return res.status(404).json({
          error: "Rastreador não encontrado",
          code: "NOT_FOUND",
        });
      }

      return res.status(200).json({
        rastreador,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
        code: "GET_ERROR",
      });
    }
  }

  /**
   * GET /rastreadores/disponiveis
   * Lista rastreadores sem veículo associado
   *
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async disponiveis(req, res) {
    try {
      const rastreadores = await rastreadorRepository.findDisponiveis();

      return res.status(200).json({
        count: rastreadores.length,
        rastreadores,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
        code: "LIST_ERROR",
      });
    }
  }

  /**
   * POST /rastreadores
   * Cria novo rastreador
   *
   * BODY esperado:
   * {
   *   "imei": "355234567890123",
   *   "modelo": "TK103",
   *   "protocolo": "GT06",
   *   "plataforma": "TK Server"
   * }
   *
   * RESPOSTA (201):
   * {
   *   "message": "Rastreador criado com sucesso",
   *   "rastreador": { ... }
   * }
   *
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async create(req, res) {
    try {
      const { imei, modelo, protocolo, plataforma } = req.body;

      // Validação
      if (!imei || !modelo) {
        return res.status(400).json({
          error: "IMEI e modelo são obrigatórios",
          code: "VALIDATION_ERROR",
        });
      }

      const rastreador = await rastreadorRepository.create({
        imei,
        modelo,
        protocolo: protocolo || "GT06",
        plataforma,
      });

      return res.status(201).json({
        message: "Rastreador criado com sucesso",
        rastreador,
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message,
        code: "CREATE_ERROR",
      });
    }
  }

  /**
   * PUT /rastreadores/:id
   * Atualiza rastreador
   *
   * BODY esperado (todos opcionais):
   * {
   *   "imei": "355234567890123",
   *   "modelo": "TK110",
   *   "protocolo": "GT06",
   *   "plataforma": "TK Server",
   *   "ativo": true
   * }
   *
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const rastreador = await rastreadorRepository.findById(id);

      if (!rastreador) {
        return res.status(404).json({
          error: "Rastreador não encontrado",
          code: "NOT_FOUND",
        });
      }

      const rastreadorAtualizado = await rastreadorRepository.update(
        id,
        req.body,
      );

      return res.status(200).json({
        message: "Rastreador atualizado com sucesso",
        rastreador: rastreadorAtualizado,
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message,
        code: "UPDATE_ERROR",
      });
    }
  }

  /**
   * DELETE /rastreadores/:id
   * Deleta rastreador
   *
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const rastreador = await rastreadorRepository.findById(id);

      if (!rastreador) {
        return res.status(404).json({
          error: "Rastreador não encontrado",
          code: "NOT_FOUND",
        });
      }

      await rastreadorRepository.delete(id);

      return res.status(200).json({
        message: "Rastreador deletado com sucesso",
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
        code: "DELETE_ERROR",
      });
    }
  }

  /**
   * POST /rastreadores/:id/veiculo/associar
   * Associa veículo ao rastreador
   *
   * BODY esperado:
   * {
   *   "veiculoId": 1
   * }
   *
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async associarVeiculo(req, res) {
    try {
      const { id } = req.params;
      const { veiculoId } = req.body;

      if (!veiculoId) {
        return res.status(400).json({
          error: "veiculoId é obrigatório",
          code: "VALIDATION_ERROR",
        });
      }

      const rastreador = await rastreadorRepository.findById(id);

      if (!rastreador) {
        return res.status(404).json({
          error: "Rastreador não encontrado",
          code: "NOT_FOUND",
        });
      }

      const rastreadorAtualizado = await rastreadorRepository.associarVeiculo(
        id,
        veiculoId,
      );

      return res.status(200).json({
        message: "Veículo associado com sucesso",
        rastreador: rastreadorAtualizado,
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message,
        code: "ASSOCIATION_ERROR",
      });
    }
  }

  /**
   * POST /rastreadores/:id/veiculo/desassociar
   * Desassocia veículo
   *
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async desassociarVeiculo(req, res) {
    try {
      const { id } = req.params;

      const rastreador = await rastreadorRepository.findById(id);

      if (!rastreador) {
        return res.status(404).json({
          error: "Rastreador não encontrado",
          code: "NOT_FOUND",
        });
      }

      const rastreadorAtualizado =
        await rastreadorRepository.desassociarVeiculo(id);

      return res.status(200).json({
        message: "Veículo desassociado com sucesso",
        rastreador: rastreadorAtualizado,
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message,
        code: "DISSOCIATION_ERROR",
      });
    }
  }

  /**
   * POST /rastreadores/:id/chip/associar
   * Associa chip ao rastreador
   *
   * BODY esperado:
   * {
   *   "chipId": 1
   * }
   *
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async associarChip(req, res) {
    try {
      const { id } = req.params;
      const { chipId } = req.body;

      if (!chipId) {
        return res.status(400).json({
          error: "chipId é obrigatório",
          code: "VALIDATION_ERROR",
        });
      }

      const rastreador = await rastreadorRepository.findById(id);

      if (!rastreador) {
        return res.status(404).json({
          error: "Rastreador não encontrado",
          code: "NOT_FOUND",
        });
      }

      const rastreadorAtualizado = await rastreadorRepository.associarChip(
        id,
        chipId,
      );

      return res.status(200).json({
        message: "Chip associado com sucesso",
        rastreador: rastreadorAtualizado,
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message,
        code: "ASSOCIATION_ERROR",
      });
    }
  }

  /**
   * POST /rastreadores/:id/chip/desassociar
   * Desassocia chip
   *
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async desassociarChip(req, res) {
    try {
      const { id } = req.params;

      const rastreador = await rastreadorRepository.findById(id);

      if (!rastreador) {
        return res.status(404).json({
          error: "Rastreador não encontrado",
          code: "NOT_FOUND",
        });
      }

      const rastreadorAtualizado =
        await rastreadorRepository.desassociarChip(id);

      return res.status(200).json({
        message: "Chip desassociado com sucesso",
        rastreador: rastreadorAtualizado,
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message,
        code: "DISSOCIATION_ERROR",
      });
    }
  }
}

export default new RastreadorController();
