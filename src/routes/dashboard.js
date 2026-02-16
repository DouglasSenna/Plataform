/**
 * @file dashboard.js
 * @description Rotas para dashboard
 *
 * Retorna dados agregados e resumo da plataforma
 * - Dashboard geral: apenas para admins
 * - Dashboard do usuário: personalizado para cada usuário
 */

import { Router } from "express";
import dashboardController from "../controllers/dashboardController.js";
import AuthMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

/**
 * GET /dashboard
 * Dashboard geral (Admin only)
 * Retorna overview completode todos os usuários, veículos e rastreadores
 */
router.get(
  "/dashboard",
  AuthMiddleware.verifyToken,
  AuthMiddleware.isAdmin,
  dashboardController.getDashboard.bind(dashboardController),
);

/**
 * GET /dashboard/user
 * Dashboard personalizado do usuário
 * Se admin: retorna dashboard geral
 * Se usuário comum: retorna apenas seus dados
 */
router.get(
  "/dashboard/user",
  AuthMiddleware.verifyToken,
  dashboardController.getUserDashboard.bind(dashboardController),
);

export default router;
