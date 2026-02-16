/**
 * @file authService.js
 * @description Serviço de autenticação e autorização
 * Gerencia login, registro, tokens JWT e refresh tokens
 *
 * CONCEITOS IMPORTANTES:
 * - Access Token: Token de curta duração (15 min) usado em requisições
 * - Refresh Token: Token de longa duração (7 dias) usado para gerar novo access token
 * - JWT: JSON Web Token - formato padrão de token na web
 * - Hash de senha: Bcrypt - nunca armazenar senha em texto plano
 *
 * @requires jsonwebtoken - Geração e verificação de JWT
 * @requires bcrypt - Hashing de senhas
 * @requires ../repositories/userRepository.js - Acesso a dados de usuário
 */

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import userRepository from "../repositories/userRepository.js";

/**
 * Classe AuthService
 * Contém toda lógica de autenticação
 */
class AuthService {
  /**
   * CONFIGURAÇÕES DE EXPIRAÇÃO DE TOKEN
   * Estes valores definem quanto tempo os tokens são válidos
   */
  static ACCESS_TOKEN_EXPIRY = "15m"; // Access token dura 15 minutos
  static REFRESH_TOKEN_EXPIRY = "7d"; // Refresh token dura 7 dias

  /**
   * Registra novo usuário na plataforma
   * Criptografa a senha com bcrypt antes de salvar
   *
   * FLUXO:
   * 1. Validar entrada (login e senha)
   * 2. Verificar se login já existe
   * 3. Criptografar senha com bcrypt (10 rounds de salt)
   * 4. Salvar novo usuário no banco
   * 5. Retornar dados do usuário (SEM a senha!)
   *
   * @param {Object} data - Dados do registro
   * @param {string} data.login - Login único do usuário
   * @param {string} data.password - Senha em texto plano (será hasheada)
   * @param {string} data.ip - IP do cliente (opcional)
   * @returns {Promise<Object>} Usuário criado com ID, login, ip
   * @throws {Error} Se login já existe ou erro no banco
   */
  async register({ login, password, ip = null }) {
    try {
      // Validação básica
      if (!login || !password) {
        throw new Error("Login e senha são obrigatórios");
      }

      if (password.length < 6) {
        throw new Error("Senha deve ter no mínimo 6 caracteres");
      }

      // Verificar se login já existe
      const existingUser = await userRepository.findByLogin(login);
      if (existingUser) {
        throw new Error("Login já existe");
      }

      // ⚠️ IMPORTANTE: Nunca armazenar senha em texto plano!
      // bcrypt.hash(password, 10):
      // - password: senha em texto plano
      // - 10: número de "rounds" (quanto maior, mais seguro mas lento)
      const hashedPassword = await bcrypt.hash(password, 10);

      // Criar usuário no banco com senha criptografada
      const user = await userRepository.create({
        login,
        password: hashedPassword, // Armazenar APENAS a senha hasheada
        ip,
        isAdmin: false, // Novos usuários não são admin
      });

      // Retornar usuário SEM a senha (nunca enviar senha ao cliente!)
      return {
        id: user.id,
        login: user.login,
        ip: user.ip,
        createdAt: user.createdAt,
      };
    } catch (error) {
      throw new Error(`Erro ao registrar: ${error.message}`);
    }
  }

  /**
   * Autentica usuário e retorna tokens
   * Este é o "login" da aplicação
   *
   * FLUXO:
   * 1. Buscar usuário por login
   * 2. Se não encontrado, retornar erro
   * 3. Comparar senha fornecida com hash armazenado
   * 4. Se não bater, retornar erro
   * 5. Gerar access token (curta duração)
   * 6. Gerar refresh token (longa duração)
   * 7. Retornar ambos os tokens
   *
   * O CLIENT deve:
   * - Armazenar access token em memória
   * - Armazenar refresh token em localStorage/cookie seguro
   * - Usar access token em todas as requisições (header Authorization)
   * - Quando access token expirar, usar refresh token para gerar novo
   *
   * @param {Object} data - Credenciais
   * @param {string} data.login - Login do usuário
   * @param {string} data.password - Senha em texto plano
   * @returns {Promise<Object>} Objeto com access_token e refresh_token
   * @throws {Error} Se credenciais inválidas
   */
  async login({ login, password, ip = null }) {
    try {
      // Validação
      if (!login || !password) {
        throw new Error("Login e senha são obrigatórios");
      }

      // Buscar usuário
      const user = await userRepository.findByLogin(login);
      if (!user) {
        throw new Error("Usuário não encontrado");
      }

      // ⚠️ SEGURANÇA: Usar bcrypt.compare para comparar senhas
      // NÃO fazer: if (password === user.password) ❌
      // Fazer: await bcrypt.compare(password, user.password) ✅
      // bcrypt.compare retorna true/false sem revelar a senha
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        throw new Error("Senha inválida");
      }

      // Gerar tokens (explicado abaixo)
      const tokens = this.generateTokens(user);

      // Atualizar IP do usuário (opcional, útil para rastreamento)
      if (ip) {
        await userRepository.update(user.id, { ip });
      }

      return {
        message: "Login realizado com sucesso",
        user: {
          id: user.id,
          login: user.login,
        },
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expiresIn: "15m", // Informar ao cliente quando token expira
      };
    } catch (error) {
      throw new Error(`Erro ao fazer login: ${error.message}`);
    }
  }

  /**
   * Gera novo access token usando refresh token válido
   * Usado quando access token expirou
   *
   * FLUXO:
   * 1. Validar refresh token
   * 2. Verificar se refresh token version bate (invalida old tokens)
   * 3. Gerar novo access token
   * 4. Retornar novo access token
   *
   * IMPORTANTE: Refresh token NÃO expira automaticamente,
   * o servidor controla validez via refreshTokenVersion
   *
   * @param {string} refreshToken - Refresh token do cliente
   * @returns {Promise<Object>} Objeto com novo access_token
   * @throws {Error} Se refresh token inválido
   */
  async refreshAccessToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw new Error("Refresh token não fornecido");
      }

      // Verificar assinatura e validade do refresh token
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);

      // Buscar usuário
      const user = await userRepository.findById(decoded.id);
      if (!user) {
        throw new Error("Usuário não encontrado");
      }

      // Validar refresh token version
      // Se o usuário fez logout ou redefiniu token, a versão será diferente
      if (decoded.version !== user.refreshTokenVersion) {
        throw new Error("Refresh token inválido");
      }

      // Gerar novo access token (refresh token continua válido)
      const accessToken = this.generateAccessToken(user);

      return {
        access_token: accessToken,
        expiresIn: "15m",
      };
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new Error("Refresh token expirado");
      }
      throw new Error(`Erro ao renovar token: ${error.message}`);
    }
  }

  /**
   * Realiza logout do usuário
   * Invalida todos os refresh tokens antigos do usuário
   *
   * FLUXO:
   * 1. Incrementar refresh token version
   * 2. Todos os tokens antigos se tornam inválidos
   * 3. Usuário precisa fazer login novamente
   *
   * Nota: Access token ainda pode ser usado até expirar (15 min)
   * Mas quando tentar renovar com refresh token, será recusado
   *
   * @param {number} userId - ID do usuário fazendo logout
   * @returns {Promise<Object>} Mensagem de sucesso
   * @throws {Error} Se usuário não existe
   */
  async logout(userId) {
    try {
      if (!userId) {
        throw new Error("ID do usuário é obrigatório");
      }

      // Incrementar versão invalida todos os refresh tokens antigos
      await userRepository.incrementRefreshTokenVersion(userId);

      return {
        message: "Logout realizado com sucesso",
      };
    } catch (error) {
      throw new Error(`Erro ao fazer logout: ${error.message}`);
    }
  }

  /**
   * ====================
   * MÉTODOS AUXILIARES
   * ====================
   */

  /**
   * Gera access token e refresh token para um usuário
   * Utilizado em duas ocasiões:
   * 1. Após login bem-sucedido
   * 2. Após renovação via refresh token
   *
   * @param {Object} user - Objeto do usuário
   * @returns {Object} { accessToken, refreshToken }
   * @private
   */
  generateTokens(user) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Gera JWT de access token
   * Token CURTO: expira em 15 minutos
   *
   * CONTEÚDO DO TOKEN (payload):
   * {
   *   id: 1,
   *   login: "usuario@email.com",
   *   isAdmin: false,
   *   iat: 1234567890, (issued at / criado em)
   *   exp: 1234568790  (expiration / expira em)
   * }
   *
   * ASSINATURA: Token é assinado com JWT_SECRET
   * Se alguém modificar token, assinatura fica inválida
   * Apenas o servidor conhece o secret, então consegue validar
   *
   * @param {Object} user - Usuário
   * @returns {string} JWT assinado
   * @private
   */
  generateAccessToken(user) {
    // Payload: dados que queremos no token
    const payload = {
      id: user.id,
      login: user.login,
      isAdmin: user.isAdmin || false,
    };

    // Assinar token com secret
    // jwt.sign(payload, secret, options)
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: AuthService.ACCESS_TOKEN_EXPIRY, // Expira em 15 minutos
    });

    return token;
  }

  /**
   * Gera JWT de refresh token
   * Token LONGO: expira em 7 dias
   *
   * CONTEÚDO DO TOKEN (payload):
   * {
   *   id: 1,
   *   version: 0, (refresh token version para validação)
   *   iat: 1234567890,
   *   exp: 1234654290 (7 dias depois)
   * }
   *
   * IMPORTANTE: Usa REFRESH_JWT_SECRET diferente do access token
   * Mais seguro usar secrets diferentes
   *
   * @param {Object} user - Usuário
   * @returns {string} JWT assinado
   * @private
   */
  generateRefreshToken(user) {
    const payload = {
      id: user.id,
      version: user.refreshTokenVersion || 0, // Versão para validação
    };

    const token = jwt.sign(payload, process.env.REFRESH_JWT_SECRET, {
      expiresIn: AuthService.REFRESH_TOKEN_EXPIRY, // Expira em 7 dias
    });

    return token;
  }
}

export default new AuthService();
