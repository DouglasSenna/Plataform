/**
 * @file authController.js
 * @description Controller para autenticação
 * Gerencia requisições de login, registro, refresh e logout
 *
 * PADRÃO MVC:
 * Controller: Recebe requisição HTTP, chama Service, retorna resposta
 * Service: Contém lógica de negócio
 * Repository: Acessa banco de dados
 *
 * O Controller NUNCA deve conter lógica de negócio, apenas orquestração
 *
 * @requires ../services/authservice.js - Lógica de autenticação
 */

import authService from "../services/authservice.js";

/**
 * Classe AuthController
 * Métodos para tratamento de rotas de autenticação
 */
class AuthController {
  /**
   * POST /auth/register
   * Registra novo usuário na plataforma
   *
   * BODY esperado:
   * {
   *   "login": "usuario@email.com",
   *   "password": "senha123",
   *   "ip": "192.168.1.1" (opcional)
   * }
   *
   * RESPOSTA (201):
   * {
   *   "id": 1,
   *   "login": "usuario@email.com",
   *   "ip": "192.168.1.1",
   *   "createdAt": "2026-02-16T10:30:00Z"
   * }
   *
   * ERROS (400):
   * {
   *   "error": "Login já existe"
   * }
   *
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   */
  async register(req, res) {
    try {
      // Desestruturar dados do body
      const { login, password, ip } = req.body;

      // Pedir ao serviço para registrar o usuário
      const user = await authService.register({
        login,
        password,
        ip: ip || null, // IP é opcional
      });

      // Retornar usuário criado com status 201 (Created)
      return res.status(201).json({
        message: "Usuário registrado com sucesso",
        user,
      });
    } catch (error) {
      // Erro na validação ou ao criar usuário
      return res.status(400).json({
        error: error.message,
        code: "REGISTRATION_ERROR",
      });
    }
  }

  /**
   * POST /auth/login
   * Autentica usuário e retorna tokens
   *
   * BODY esperado:
   * {
   *   "login": "usuario@email.com",
   *   "password": "senha123",
   *   "ip": "192.168.1.1" (opcional)
   * }
   *
   * RESPOSTA (200):
   * {
   *   "message": "Login realizado com sucesso",
   *   "user": {
   *     "id": 1,
   *     "login": "usuario@email.com"
   *   },
   *   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *   "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *   "expiresIn": "15m"
   * }
   *
   * ERROS (401):
   * {
   *   "error": "Usuário não encontrado",
   *   "code": "INVALID_CREDENTIALS"
   * }
   *
   * @param {Object} req - Objeto de requisição
   * @param {Object} res - Objeto de resposta
   */
  async login(req, res) {
    try {
      const { login, password, ip } = req.body;

      // Pedir ao serviço para autenticar
      const result = await authService.login({
        login,
        password,
        ip,
      });

      // Retornar tokens (armazenar em localStorage no frontend)
      // ⚠️ IMPORTANTE: Nunca enviar access_token em Cookie com HttpOnly=false
      // Mantém no localStorage e envia via header Authorization
      return res.status(200).json(result);
    } catch (error) {
      return res.status(401).json({
        error: error.message,
        code: "INVALID_CREDENTIALS",
      });
    }
  }

  /**
   * POST /auth/refresh
   * Renova o access token usando refresh token
   *
   * Chamado quando access_token expirou (após 15 min)
   *
   * BODY esperado:
   * {
   *   "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   * }
   *
   * RESPOSTA (200):
   * {
   *   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *   "expiresIn": "15m"
   * }
   *
   * ERROS (401):
   * {
   *   "error": "Refresh token expirado",
   *   "code": "TOKEN_EXPIRED"
   * }
   *
   * @param {Object} req - Objeto de requisição
   * @param {Object} res - Objeto de resposta
   */
  async refresh(req, res) {
    try {
      const { refresh_token } = req.body;

      // Pedir ao serviço para renovar token
      const result = await authService.refreshAccessToken(refresh_token);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(401).json({
        error: error.message,
        code: "REFRESH_ERROR",
      });
    }
  }

  /**
   * POST /auth/logout
   * Faz logout do usuário
   * Invalida todos os refresh tokens antigos dele
   *
   * O access_token ainda pode ser usado até expirar (15 min)
   * Mas tentar renovar com refresh token retornará erro
   *
   * HEADERS esperado:
   * Authorization: Bearer <access_token>
   * (req.user.id será injetado pelo middleware verifyToken)
   *
   * RESPOSTA (200):
   * {
   *   "message": "Logout realizado com sucesso"
   * }
   *
   * ERROS (401):
   * {
   *   "error": "Token não fornecido",
   *   "code": "NO_TOKEN"
   * }
   *
   * @param {Object} req - Objeto de requisição (com req.user injetado)
   * @param {Object} res - Objeto de resposta
   */
  async logout(req, res) {
    try {
      // req.user é injetado pelo middleware verifyToken
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          error: "Usuário não autenticado",
          code: "NO_USER",
        });
      }

      // Pedir ao serviço para fazer logout
      const result = await authService.logout(userId);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        error: error.message,
        code: "LOGOUT_ERROR",
      });
    }
  }
}

export default new AuthController();
