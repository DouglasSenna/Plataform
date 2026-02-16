/**
 * @file veiculoController.js
 * @description Controller para operações CRUD de Veículos
 * Gerencia requisições HTTP para criar, listar, atualizar e deletar veículos
 *
 * @requires ../repositories/veiculoRepository.js - Acesso a dados de veículos
 */

import veiculoRepository from "../repositories/veiculoRepository.js";

/**
 * Classe VeiculoController
 * Métodos para tratamento de rotas
 */
class VeiculoController {
  /**
   * GET /veiculos
   * Lista todos os veículos do usuário autenticado
   *
   * QUERY params (opcional):
   * - userId: se for admin, pode filtrar por outro usuário
   *
   * RESPOSTA (200):
   * {
   *   "veiculos": [
   *     {
   *       "id": 1,
   *       "placa": "ABC-1234",
   *       "modelo": "Honda Civic",
   *       "ano": 2023,
   *       "cor": "Branco",
   *       "rastreador": {
   *         "id": 1,
   *         "imei": "355234567890123",
   *         "modelo": "TK103",
   *         "ativo": true
   *       }
   *     }
   *   ]
   * }
   *
   * @param {Object} req - Requisição com req.user (do middleware)
   * @param {Object} res - Resposta
   */
  async list(req, res) {
    try {
      // Se for admin, pode listar todos os veículos
      // Senão, lista apenas seus veículos
      let veiculos;

      if (req.user.isAdmin) {
        // Admin: listar todos
        veiculos = await veiculoRepository.findAll();
      } else {
        // Usuário comum: apenas seus veículos
        veiculos = await veiculoRepository.findByUserId(req.user.id);
      }

      return res.status(200).json({
        count: veiculos.length,
        veiculos,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
        code: "LIST_ERROR",
      });
    }
  }

  /**
   * GET /veiculos/:id
   * Busca um veículo específico com todos seus dados
   *
   * RESPOSTA (200):
   * {
   *   "veiculo": {
   *     "id": 1,
   *     "placa": "ABC-1234",
   *     "modelo": "Honda Civic",
   *     "ano": 2023,
   *     "cor": "Branco",
   *     "usuario": {
   *       "id": 1,
   *       "login": "usuario@email.com"
   *     },
   *     "rastreador": {
   *       "id": 1,
   *       "imei": "355234567890123",
   *       "modelo": "TK103",
   *       "protocolo": "GT06",
   *       "ativo": true,
   *       "chip": {
   *         "id": 1,
   *         "iccid": "89551234567890123456",
   *         "linha": "11999887766",
   *         "operadora": "Vivo",
   *         "apn": "zap.vivo.com.br",
   *         "porta": 26959,
   *         "ativo": true
   *       }
   *     }
   *   }
   * }
   *
   * @param {Object} req - Requisição com :id e req.user
   * @param {Object} res - Resposta
   */
  async getById(req, res) {
    try {
      const { id } = req.params;

      const veiculo = await veiculoRepository.findById(id);

      if (!veiculo) {
        return res.status(404).json({
          error: "Veículo não encontrado",
          code: "NOT_FOUND",
        });
      }

      // Validar permissão: usuário só pode ver seus próprios veículos
      // Admin pode ver qualquer um
      if (!req.user.isAdmin && veiculo.userId !== req.user.id) {
        return res.status(403).json({
          error: "Permissão negada",
          code: "FORBIDDEN",
        });
      }

      return res.status(200).json({
        veiculo,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
        code: "GET_ERROR",
      });
    }
  }

  /**
   * POST /veiculos
   * Cria novo veículo para o usuário
   *
   * BODY esperado:
   * {
   *   "placa": "ABC-1234",
   *   "modelo": "Honda Civic",
   *   "ano": 2023,
   *   "cor": "Branco"
   * }
   *
   * RESPOSTA (201):
   * {
   *   "message": "Veículo criado com sucesso",
   *   "veiculo": {
   *     "id": 1,
   *     "placa": "ABC-1234",
   *     "modelo": "Honda Civic",
   *     "ano": 2023,
   *     "cor": "Branco",
   *     "userId": 1
   *   }
   * }
   *
   * @param {Object} req - Requisição com body e req.user
   * @param {Object} res - Resposta
   */
  async create(req, res) {
    try {
      const { placa, modelo, ano, cor } = req.body;

      // Validação básica
      if (!placa || !modelo || !ano) {
        return res.status(400).json({
          error: "Placa, modelo e ano são obrigatórios",
          code: "VALIDATION_ERROR",
        });
      }

      // Criar veículo associado ao usuário autenticado
      const veiculo = await veiculoRepository.create(req.user.id, {
        placa,
        modelo,
        ano,
        cor,
      });

      return res.status(201).json({
        message: "Veículo criado com sucesso",
        veiculo,
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message,
        code: "CREATE_ERROR",
      });
    }
  }

  /**
   * PUT /veiculos/:id
   * Atualiza dados de um veículo
   *
   * BODY esperado (todos opcionais):
   * {
   *   "placa": "ABC-1234",
   *   "modelo": "Honda Civic",
   *   "ano": 2023,
   *   "cor": "Branco"
   * }
   *
   * RESPOSTA (200):
   * {
   *   "message": "Veículo atualizado com sucesso",
   *   "veiculo": { ... }
   * }
   *
   * @param {Object} req - Requisição com :id, body e req.user
   * @param {Object} res - Resposta
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const veiculo = await veiculoRepository.findById(id);

      if (!veiculo) {
        return res.status(404).json({
          error: "Veículo não encontrado",
          code: "NOT_FOUND",
        });
      }

      // Validar permissão
      if (!req.user.isAdmin && veiculo.userId !== req.user.id) {
        return res.status(403).json({
          error: "Permissão negada",
          code: "FORBIDDEN",
        });
      }

      const veiculoAtualizado = await veiculoRepository.update(id, updateData);

      return res.status(200).json({
        message: "Veículo atualizado com sucesso",
        veiculo: veiculoAtualizado,
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message,
        code: "UPDATE_ERROR",
      });
    }
  }

  /**
   * DELETE /veiculos/:id
   * Deleta um veículo
   *
   * RESPOSTA (200):
   * {
   *   "message": "Veículo deletado com sucesso"
   * }
   *
   * @param {Object} req - Requisição com :id e req.user
   * @param {Object} res - Resposta
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const veiculo = await veiculoRepository.findById(id);

      if (!veiculo) {
        return res.status(404).json({
          error: "Veículo não encontrado",
          code: "NOT_FOUND",
        });
      }

      // Validar permissão
      if (!req.user.isAdmin && veiculo.userId !== req.user.id) {
        return res.status(403).json({
          error: "Permissão negada",
          code: "FORBIDDEN",
        });
      }

      await veiculoRepository.delete(id);

      return res.status(200).json({
        message: "Veículo deletado com sucesso",
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
        code: "DELETE_ERROR",
      });
    }
  }

  /**
   * POST /veiculos/:id/rastreador/associar
   * Associa um rastreador ao veículo
   *
   * BODY esperado:
   * {
   *   "rastreadorId": 1
   * }
   *
   * RESPOSTA (200):
   * {
   *   "message": "Rastreador associado com sucesso",
   *   "veiculo": { ... }
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

      const veiculo = await veiculoRepository.findById(id);

      if (!veiculo) {
        return res.status(404).json({
          error: "Veículo não encontrado",
          code: "NOT_FOUND",
        });
      }

      if (!req.user.isAdmin && veiculo.userId !== req.user.id) {
        return res.status(403).json({
          error: "Permissão negada",
          code: "FORBIDDEN",
        });
      }

      const veiculoAtualizado = await veiculoRepository.associarRastreador(
        id,
        rastreadorId,
      );

      return res.status(200).json({
        message: "Rastreador associado com sucesso",
        veiculo: veiculoAtualizado,
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message,
        code: "ASSOCIATION_ERROR",
      });
    }
  }

  /**
   * POST /veiculos/:id/rastreador/desassociar
   * Desassocia rastreador do veículo
   *
   * RESPOSTA (200):
   * {
   *   "message": "Rastreador desassociado com sucesso",
   *   "veiculo": { ... }
   * }
   *
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async desassociarRastreador(req, res) {
    try {
      const { id } = req.params;

      const veiculo = await veiculoRepository.findById(id);

      if (!veiculo) {
        return res.status(404).json({
          error: "Veículo não encontrado",
          code: "NOT_FOUND",
        });
      }

      if (!req.user.isAdmin && veiculo.userId !== req.user.id) {
        return res.status(403).json({
          error: "Permissão negada",
          code: "FORBIDDEN",
        });
      }

      const veiculoAtualizado =
        await veiculoRepository.desassociarRastreador(id);

      return res.status(200).json({
        message: "Rastreador desassociado com sucesso",
        veiculo: veiculoAtualizado,
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message,
        code: "DISSOCIATION_ERROR",
      });
    }
  }
}

export default new VeiculoController();
