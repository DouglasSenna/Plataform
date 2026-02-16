/**
 * @file userController.js
 * @description Controller para operações com usuários (Admin only)
 * Gerencia requisições HTTP para gerência de usuários
 *
 * @requires ../repositories/userRepository.js - Acesso a dados de usuários
 */

import userRepository from "../repositories/userRepository.js";

/**
 * Classe UserController
 * Métodos para tratamento de rotas (Admin only)
 */
class UserController {
  /**
   * GET /users
   * Lista todos os usuários (Admin only)
   *
   * RESPOSTA (200):
   * {
   *   "count": 5,
   *   "users": [
   *     {
   *       "id": 1,
   *       "login": "admin@email.com",
   *       "ip": "192.168.1.1",
   *       "isAdmin": true,
   *       "createdAt": "2026-02-16T10:00:00Z"
   *     }
   *   ]
   * }
   *
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async list(req, res) {
    try {
      const users = await userRepository.findAll();

      return res.status(200).json({
        count: users.length,
        users,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
        code: "LIST_ERROR",
      });
    }
  }

  /**
   * GET /users/:id
   * Busca usuário específico com seus veículos (Admin only)
   *
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async getById(req, res) {
    try {
      const { id } = req.params;

      const user = await userRepository.findWithVeiculos(id);

      if (!user) {
        return res.status(404).json({
          error: "Usuário não encontrado",
          code: "NOT_FOUND",
        });
      }

      // Não retornar senha
      const userData = {
        ...user.toJSON(),
        password: undefined,
      };

      return res.status(200).json({
        user: userData,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
        code: "GET_ERROR",
      });
    }
  }

  /**
   * PATCH /users/:id/admin
   * Altera status de admin de um usuário (Admin only)
   *
   * BODY esperado:
   * {
   *   "isAdmin": true
   * }
   *
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async updateAdminStatus(req, res) {
    try {
      const { id } = req.params;
      const { isAdmin } = req.body;

      if (typeof isAdmin !== "boolean") {
        return res.status(400).json({
          error: "isAdmin deve ser true ou false",
          code: "VALIDATION_ERROR",
        });
      }

      const user = await userRepository.findById(id);

      if (!user) {
        return res.status(404).json({
          error: "Usuário não encontrado",
          code: "NOT_FOUND",
        });
      }

      // Não permitir remover admin status do único admin
      if (user.isAdmin && !isAdmin) {
        const admins = await userRepository.findAll();
        const adminCount = admins.filter((u) => u.isAdmin).length;

        if (adminCount === 1) {
          return res.status(400).json({
            error: "Não pode remover admin status do último admin",
            code: "VALIDATION_ERROR",
          });
        }
      }

      const updatedUser = await userRepository.update(id, { isAdmin });

      return res.status(200).json({
        message: "Status de admin atualizado com sucesso",
        user: {
          id: updatedUser.id,
          login: updatedUser.login,
          isAdmin: updatedUser.isAdmin,
        },
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message,
        code: "UPDATE_ERROR",
      });
    }
  }

  /**
   * DELETE /users/:id
   * Deleta um usuário (Admin only)
   * Deleta em cascata todos seus veículos, rastreadores e chips
   *
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Não permitir deletar a si mesmo
      if (req.user.id === parseInt(id)) {
        return res.status(400).json({
          error: "Não pode deletar sua própria conta",
          code: "VALIDATION_ERROR",
        });
      }

      const user = await userRepository.findById(id);

      if (!user) {
        return res.status(404).json({
          error: "Usuário não encontrado",
          code: "NOT_FOUND",
        });
      }

      await userRepository.delete(id);

      return res.status(200).json({
        message: "Usuário deletado com sucesso",
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
        code: "DELETE_ERROR",
      });
    }
  }
}

export default new UserController();
