/**
 * @file chips.js
 * @description Rotas para gerência de chips SIM
 *
 * Rotas protegidas por autenticação
 * Apenas admins podem CRUD de chips
 */

import { Router } from "express";
import chipController from "../controllers/chipController.js";
import AuthMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

/**
 * GET /chips
 * Lista todos os chips (Admin only)
 *
 * Query params:
 * - operadora: filtrar por operadora específica
 */
router.get(
  "/chips",
  AuthMiddleware.verifyToken,
  AuthMiddleware.isAdmin,
  chipController.list.bind(chipController),
);

/**
 * GET /chips/:id
 * Busca chip específico
 */
router.get(
  "/chips/:id",
  AuthMiddleware.verifyToken,
  AuthMiddleware.isAdmin,
  chipController.getById.bind(chipController),
);

/**
 * GET /chips/disponíveis
 * Lista chips sem rastreador (disponíveis para uso)
 */
router.get(
  "/chips/disponíveis",
  AuthMiddleware.verifyToken,
  AuthMiddleware.isAdmin,
  chipController.disponiveis.bind(chipController),
);

/**
 * POST /chips
 * Cria novo chip (Admin only)
 *
 * Body: {
 *   iccid: string,
 *   linha: string,
 *   operadora: string,
 *   apn: string,
 *   porta: number
 * }
 */
router.post(
  "/chips",
  AuthMiddleware.verifyToken,
  AuthMiddleware.isAdmin,
  chipController.create.bind(chipController),
);

/**
 * PUT /chips/:id
 * Atualiza chip (Admin only)
 */
router.put(
  "/chips/:id",
  AuthMiddleware.verifyToken,
  AuthMiddleware.isAdmin,
  chipController.update.bind(chipController),
);

/**
 * DELETE /chips/:id
 * Deleta chip (Admin only)
 */
router.delete(
  "/chips/:id",
  AuthMiddleware.verifyToken,
  AuthMiddleware.isAdmin,
  chipController.delete.bind(chipController),
);

/**
 * POST /chips/:id/rastreador/associar
 * Associa rastreador ao chip
 *
 * Body: { rastreadorId }
 */
router.post(
  "/chips/:id/rastreador/associar",
  AuthMiddleware.verifyToken,
  AuthMiddleware.isAdmin,
  chipController.associarRastreador.bind(chipController),
);

/**
 * POST /chips/:id/rastreador/desassociar
 * Desassocia rastreador
 */
router.post(
  "/chips/:id/rastreador/desassociar",
  AuthMiddleware.verifyToken,
  AuthMiddleware.isAdmin,
  chipController.desassociarRastreador.bind(chipController),
);

export default router;
