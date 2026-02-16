/**
 * @file userRepository.js
 * @description Repository para User
 * Centraliza toda lógica de acesso/manipulação de dados de usuários
 *
 * Pattern de Repository:
 * - Abstrai detalhes do banco de dados
 * - Facilita testes unitários (mock this repository)
 * - Mantém controllers e services limpos
 *
 * @requires ../models/user.js - Modelo User do Sequelize
 */

import User from "../models/user.js";

/**
 * Classe UserRepository
 * Métodos para CRUD de usuários no banco de dados
 */
class UserRepository {
  /**
   * Busca usuário por login
   * Útil para validar se login já existe e para autenticação
   *
   * @param {string} login - Login do usuário
   * @returns {Promise<User|null>} Usuário encontrado ou null
   * @throws {Error} Se houver erro no banco
   */
  async findByLogin(login) {
    try {
      const user = await User.findOne({
        where: { login }, // WHERE login = ?
      });
      return user;
    } catch (error) {
      throw new Error(`Erro ao buscar usuário por login: ${error.message}`);
    }
  }

  /**
   * Busca usuário por ID
   * Usado após autenticação para obter dados do usuário
   *
   * @param {number} id - ID do usuário
   * @returns {Promise<User|null>} Usuário encontrado ou null
   * @throws {Error} Se houver erro no banco
   */
  async findById(id) {
    try {
      const user = await User.findByPk(id); // findByPk = find By Primary Key
      return user;
    } catch (error) {
      throw new Error(`Erro ao buscar usuário por ID: ${error.message}`);
    }
  }

  /**
   * Cria novo usuário no banco
   * Chamado durante o registro
   *
   * @param {Object} userData - Dados do usuário
   * @param {string} userData.login - Login único
   * @param {string} userData.password - Senha criptografada (já deve estar hasheada)
   * @param {string} userData.ip - IP do cliente
   * @returns {Promise<User>} Usuário criado
   * @throws {Error} Se login já existe ou erro no banco
   */
  async create(userData) {
    try {
      const user = await User.create({
        login: userData.login,
        password: userData.password,
        ip: userData.ip || null,
        isAdmin: userData.isAdmin || false,
      });
      return user;
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new Error("Login já existe");
      }
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    }
  }

  /**
   * Busca todos os usuários
   * Útil para admin consultar usuarios registrados
   * SELECT * FROM users
   *
   * @returns {Promise<User[]>} Lista de usuários
   * @throws {Error} Se houver erro no banco
   */
  async findAll() {
    try {
      const users = await User.findAll({
        attributes: ["id", "login", "ip", "isAdmin", "createdAt"], // Não retornar senha
        order: [["createdAt", "DESC"]], // Mais recentes primeiro
      });
      return users;
    } catch (error) {
      throw new Error(`Erro ao buscar usuários: ${error.message}`);
    }
  }

  /**
   * Busca usuário com todos seus veículos associados
   * Útil para dashboard exibir dados do cliente e seus veículos
   *
   * @param {number} id - ID do usuário
   * @returns {Promise<User|null>} Usuário com veículos
   * @throws {Error} Se houver erro no banco
   */
  async findWithVeiculos(id) {
    try {
      const user = await User.findByPk(id, {
        include: [
          {
            association: "veiculos", // Use o alias definido no relacionamento
            attributes: ["id", "placa", "modelo", "ano", "cor"],
          },
        ],
      });
      return user;
    } catch (error) {
      throw new Error(`Erro ao buscar usuário com veículos: ${error.message}`);
    }
  }

  /**
   * Atualiza dados de um usuário
   * Usado para editar perfil, IP, status admin, etc.
   *
   * @param {number} id - ID do usuário
   * @param {Object} updateData - Dados a atualizar
   * @returns {Promise<User>} Usuário atualizado
   * @throws {Error} Se usuário não existe ou erro no banco
   */
  async update(id, updateData) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error("Usuário não encontrado");
      }

      // Permissões para atualizar apenas campos específicos
      const allowedFields = ["isAdmin", "ip"];
      const filteredData = {};

      allowedFields.forEach((field) => {
        if (field in updateData) {
          filteredData[field] = updateData[field];
        }
      });

      await user.update(filteredData);
      return user;
    } catch (error) {
      throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }
  }

  /**
   * Incrementa refresh token version
   * Força logout de todas as sessões do usuário (invalida tokens antigos)
   *
   * @param {number} id - ID do usuário
   * @returns {Promise<User>} Usuário com versão incrementada
   * @throws {Error} Se usuário não existe
   */
  async incrementRefreshTokenVersion(id) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error("Usuário não encontrado");
      }

      await user.increment("refreshTokenVersion");
      return user;
    } catch (error) {
      throw new Error(`Erro ao incrementar token version: ${error.message}`);
    }
  }

  /**
   * Deleta um usuário (e seus veículos em cascata)
   * DELETE FROM users WHERE id = ?
   *
   * @param {number} id - ID do usuário
   * @returns {Promise<boolean>} true se deletado
   * @throws {Error} Se usuário não existe
   */
  async delete(id) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error("Usuário não encontrado");
      }

      await user.destroy(); // DELETE
      return true;
    } catch (error) {
      throw new Error(`Erro ao deletar usuário: ${error.message}`);
    }
  }
}

export default new UserRepository();
