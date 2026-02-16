/**
 * @file veiculos.js
 * @description Rotas para gerência de veículos
 *
 * Rotas protegidas por autenticação
 * Usuários podem ver/editar apenas seus próprios veículos
 * Admins podem ver/editar todos os veículos
 */

import { Router } from "express";
import veiculoController from "../controllers/veiculoController.js";
import AuthMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

/**
 * GET /veiculos
 * Lista veículos
 * - Usuário comum: lista seus próprios veículos
 * - Admin: lista todos os veículos
 */
router.get(
  "/veiculos",
  AuthMiddleware.verifyToken,
  veiculoController.list.bind(veiculoController),
);

/**
 * GET /veiculos/:id
 * Busca veículo específico com todos os dados relacionados
 */
router.get(
  "/veiculos/:id",
  AuthMiddleware.verifyToken,
  veiculoController.getById.bind(veiculoController),
);

/**
 * POST /veiculos
 * Cria novo veículo para o usuário autenticado
 *
 * Body: { placa, modelo, ano, cor(optional) }
 */
router.post(
  "/veiculos",
  AuthMiddleware.verifyToken,
  veiculoController.create.bind(veiculoController),
);

/**
 * PUT /veiculos/:id
 * Atualiza veículo
 */
router.put(
  "/veiculos/:id",
  AuthMiddleware.verifyToken,
  veiculoController.update.bind(veiculoController),
);

/**
 * DELETE /veiculos/:id
 * Deleta veículo
 */
router.delete(
  "/veiculos/:id",
  AuthMiddleware.verifyToken,
  veiculoController.delete.bind(veiculoController),
);

/**
 * POST /veiculos/:id/rastreador/associar
 * Associa rastreador ao veículo
 * Um veículo pode ter no máximo um rastreador
 *
 * Body: { rastreadorId }
 */
router.post(
  "/veiculos/:id/rastreador/associar",
  AuthMiddleware.verifyToken,
  veiculoController.associarRastreador.bind(veiculoController),
);

/**
 * POST /veiculos/:id/rastreador/desassociar
 * Desassocia rastreador do veículo
 */
router.post(
  "/veiculos/:id/rastreador/desassociar",
  AuthMiddleware.verifyToken,
  veiculoController.desassociarRastreador.bind(veiculoController),
);

export default router;
