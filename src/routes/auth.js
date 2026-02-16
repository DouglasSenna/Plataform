/**
 * @file auth.js
 * @description Rotas de autenticação
 * Gerencia login, registro, refresh e logout
 *
 * @requires ../controllers/authController.js - Controlador de autenticação
 * @requires ../middlewares/authMiddleware.js - Verificação de token
 */

import { Router } from "express";
import authController from "../controllers/authController.js";
import AuthMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

/**
 * POST /auth/register
 * Registra novo usuário
 *
 * Body: { login, password, ip(optional) }
 * Response: { user }
 */
router.post("/auth/register", authController.register.bind(authController));

/**
 * POST /auth/login
 * Autentica usuário
 *
 * Body: { login, password, ip(optional) }
 * Response: { access_token, refresh_token, user }
 */
router.post("/auth/login", authController.login.bind(authController));

/**
 * POST /auth/refresh
 * Renova access token
 * Usado quando access_token expirou (após 15 min)
 *
 * Body: { refresh_token }
 * Response: { access_token, expiresIn }
 */
router.post("/auth/refresh", authController.refresh.bind(authController));

/**
 * POST /auth/logout
 * Faz logout invalidando refresh tokens
 *
 * Headers: Authorization: Bearer <token>
 * Response: { message }
 */
router.post(
  "/auth/logout",
  AuthMiddleware.verifyToken,
  authController.logout.bind(authController),
);

export default router;
