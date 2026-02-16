/**
 * @file routes/index.js
 * @description Arquivo central de rotas da aplicação
 * Importa e monta todas as rotas em um único router
 *
 * ESTRUTURA DE ROTAS:
 * - /auth: autenticação (login, register, logout, refresh)
 * - /dashboard: dados agregados (admin e usuário)
 * - /veiculos: CRUD de veículos
 * - /rastreadores: CRUD de rastreadores
 * - /chips: CRUD de chips
 * - /users: gerência de usuários (admin only)
 */

import { Router } from "express";
import authRoutes from "./auth.js";
import dashboardRoutes from "./dashboard.js";
import veiculosRoutes from "./veiculos.js";
import rastreadorasRoutes from "./rastreadores.js";
import chipsRoutes from "./chips.js";
import usersRoutes from "./users.js";

const routes = Router();

// ===== ROTAS PÚBLICAS (sem autenticação) =====
// Auth: login, register, refresh token
routes.use(authRoutes);

// ===== ROTAS PROTEGIDAS (com autenticação) =====
// Dashboard: overview da plataforma
routes.use(dashboardRoutes);

// Veículos: CRUD com relações
routes.use(veiculosRoutes);

// Rastreadores: CRUD e associações
routes.use(rastreadorasRoutes);

// Chips: CRUD e associações
routes.use(chipsRoutes);

// Usuários: gerência (admin only)
routes.use(usersRoutes);

/**
 * ROTA PADRÃO 404
 * Retorna erro para qualquer rota não definida
 */
routes.use((req, res) => {
  return res.status(404).json({
    error: "Rota não encontrada",
    path: req.path,
    method: req.method,
    code: "NOT_FOUND",
  });
});

export default routes;
