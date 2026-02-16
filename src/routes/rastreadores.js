/**
 * @file rastreadores.js
 * @description Rotas para gerência de rastreadores GPS
 *
 * Rotas protegidas por autenticação
 * Apenas admins podem criar/editar rastreadores
 */

import { Router } from "express";
import rastreadorController from "../controllers/rastreadorController.js";
import AuthMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

/**
 * GET /rastreadores
 * Lista todos os rastreadores (Admin only)
 */
router.get(
  "/rastreadores",
  AuthMiddleware.verifyToken,
  rastreadorController.list.bind(rastreadorController),
);

/**
 * GET /rastreadores/:id
 * Busca rastreador específico
 */
router.get(
  "/rastreadores/:id",
  AuthMiddleware.verifyToken,
  rastreadorController.getById.bind(rastreadorController),
);

/**
 * GET /rastreadores/disponiveis
 * Lista rastreadores sem veículo (disponíveis para uso)
 * Útil para seleção ao criar/editar veículos
 */
router.get(
  "/rastreadores/disponíveis",
  AuthMiddleware.verifyToken,
  rastreadorController.disponiveis.bind(rastreadorController),
);

/**
 * POST /rastreadores
 * Cria novo rastreador (Admin only)
 *
 * Body: { imei, modelo, protocolo(optional), plataforma(optional) }
 */
router.post(
  "/rastreadores",
  AuthMiddleware.verifyToken,
  AuthMiddleware.isAdmin,
  rastreadorController.create.bind(rastreadorController),
);

/**
 * PUT /rastreadores/:id
 * Atualiza rastreador (Admin only)
 */
router.put(
  "/rastreadores/:id",
  AuthMiddleware.verifyToken,
  AuthMiddleware.isAdmin,
  rastreadorController.update.bind(rastreadorController),
);

/**
 * DELETE /rastreadores/:id
 * Deleta rastreador (Admin only)
 */
router.delete(
  "/rastreadores/:id",
  AuthMiddleware.verifyToken,
  AuthMiddleware.isAdmin,
  rastreadorController.delete.bind(rastreadorController),
);

/**
 * POST /rastreadores/:id/veiculo/associar
 * Associa veículo ao rastreador
 * Um rastreador pode ter no máximo um veículo
 *
 * Body: { veiculoId }
 */
router.post(
  "/rastreadores/:id/veiculo/associar",
  AuthMiddleware.verifyToken,
  AuthMiddleware.isAdmin,
  rastreadorController.associarVeiculo.bind(rastreadorController),
);

/**
 * POST /rastreadores/:id/veiculo/desassociar
 * Desassocia veículo do rastreador
 */
router.post(
  "/rastreadores/:id/veiculo/desassociar",
  AuthMiddleware.verifyToken,
  AuthMiddleware.isAdmin,
  rastreadorController.desassociarVeiculo.bind(rastreadorController),
);

/**
 * POST /rastreadores/:id/chip/associar
 * Associa chip ao rastreador
 *
 * Body: { chipId }
 */
router.post(
  "/rastreadores/:id/chip/associar",
  AuthMiddleware.verifyToken,
  AuthMiddleware.isAdmin,
  rastreadorController.associarChip.bind(rastreadorController),
);

/**
 * POST /rastreadores/:id/chip/desassociar
 * Desassocia chip do rastreador
 */
router.post(
  "/rastreadores/:id/chip/desassociar",
  AuthMiddleware.verifyToken,
  AuthMiddleware.isAdmin,
  rastreadorController.desassociarChip.bind(rastreadorController),
);

export default router;
