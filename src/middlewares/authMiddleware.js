/**
 * @file authMiddleware.js
 * @description Middleware de autenticação JWT
 * Valida tokens nas requisições protegidas
 *
 * FLUXO:
 * 1. Cliente envia token no header Authorization: "Bearer <token>"
 * 2. Middleware extrai e valida o token
 * 3. Se válido, injeta dados do usuário na requisição
 * 4. Se inválido, retorna erro 401
 *
 * Usar este middleware nas rotas que precisam autenticação:
 * router.post("/veiculos", AuthMiddleware.verifyToken, veiculoController.create)
 *
 * @requires jsonwebtoken - Verificação de JWT
 */

import jwt from "jsonwebtoken";

/**
 * Classe AuthMiddleware
 * Métodos para verificação de autenticação
 */
class AuthMiddleware {
  /**
   * Middleware para verificar access token
   * Valida o JWT e injeta usuário na requisição (req.user)
   *
   * O TOKEN vem no header no formato:
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @param {Function} next - Função para passar para próximo middleware
   * @returns {void} Chama next() se válido ou retorna erro
   */
  static verifyToken(req, res, next) {
    try {
      // Obter header de autorização
      // Exemplo: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      const authHeader = req.headers.authorization;

      // Se não houver header, retornar erro 401
      if (!authHeader) {
        return res.status(401).json({
          error: "Token não fornecido",
          code: "NO_TOKEN",
        });
      }

      // Extrair token removendo "Bearer "
      // "Bearer token_aqui".split(" ")[1] = "token_aqui"
      const token = authHeader.split(" ")[1];

      // Validar formato
      if (!token) {
        return res.status(401).json({
          error: "Token mal formatado",
          code: "INVALID_FORMAT",
        });
      }

      // Verificar assinatura e validade do token
      // Se alguém modificou o token, jwt.verify vai recusar
      // Se token expirou (15 min), jwt.verify vai recusar
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Token válido! Injetar dados do usuário na requisição
      // req.user pode ser acessado em qualquer lugar do código da rota
      req.user = {
        id: decoded.id,
        login: decoded.login,
        isAdmin: decoded.isAdmin || false,
      };

      // Passar para próximo middleware/rota
      return next();
    } catch (error) {
      // Tratamento de erros de token
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          error: "Token expirado",
          code: "TOKEN_EXPIRED",
          expiredAt: error.expiredAt,
        });
      }

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          error: "Token inválido",
          code: "INVALID_TOKEN",
        });
      }

      return res.status(401).json({
        error: "Erro ao validar token",
        code: "VALIDATION_ERROR",
      });
    }
  }

  /**
   * Middleware para verificar se usuário é Admin
   * DEVE ser usado APÓS verifyToken
   *
   * Uso:
   * router.delete("/users/:id", AuthMiddleware.verifyToken, AuthMiddleware.isAdmin, userController.delete)
   *
   * @param {Object} req - Objeto de requisição
   * @param {Object} res - Objeto de resposta
   * @param {Function} next - Função para próximo middleware
   * @returns {void}
   */
  static isAdmin(req, res, next) {
    try {
      // req.user deve estar disponível (injetado por verifyToken)
      if (!req.user) {
        return res.status(401).json({
          error: "Usuário não autenticado",
          code: "NO_USER",
        });
      }

      // Verificar se usuário é admin
      if (!req.user.isAdmin) {
        return res.status(403).json({
          error: "Permissão negada - Admin required",
          code: "NOT_ADMIN",
        });
      }

      // Admin verificado, continuar
      return next();
    } catch (error) {
      return res.status(500).json({
        error: "Erro ao verificar permissões",
        code: "PERMISSION_ERROR",
      });
    }
  }
}

export default AuthMiddleware;
