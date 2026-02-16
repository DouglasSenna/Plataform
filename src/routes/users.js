/**
 * @file users.js
 * @description Rotas para gerência de usuários
 *
 * Apenas admins podem acessar estas rotas
 * Gerencia usuários, permissões e dashboard
 */

import { Router } from "express";
import userController from "../controllers/userController.js";
import AuthMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

/**
 * GET /users
 * Lista todos os usuários (Admin only)
 * Retorna todas as contas registradas
 */
router.get(
  "/users",
  AuthMiddleware.verifyToken,
  AuthMiddleware.isAdmin,
  userController.list.bind(userController),
);

/**
 * GET /users/:id
 * Obtém usuário específico com seus veículos (Admin only)
 * Retorna dados do usuário e lista de seus veículos
 */
router.get(
  "/users/:id",
  AuthMiddleware.verifyToken,
  AuthMiddleware.isAdmin,
  userController.getById.bind(userController),
);

/**
 * PATCH /users/:id/admin
 * Altera status de admin de um usuário (Admin only)
 *
 * Body: { isAdmin: true|false }
 * Protege para não remover o último admin
 */
router.patch(
  "/users/:id/admin",
  AuthMiddleware.verifyToken,
  AuthMiddleware.isAdmin,
  userController.updateAdminStatus.bind(userController),
);

/**
 * DELETE /users/:id
 * Deleta usuário (Admin only)
 * Deleta em cascata: veículos, rastreadores, chips
 * Protege contra auto-exclusão
 */
router.delete(
  "/users/:id",
  AuthMiddleware.verifyToken,
  AuthMiddleware.isAdmin,
  userController.delete.bind(userController),
);

export default router;
