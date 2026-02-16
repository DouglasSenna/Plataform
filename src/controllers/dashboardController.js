/**
 * @file dashboardController.js
 * @description Controller para dashboard
 * Retorna dados agregados para exibição em dashboard
 *
 * IMPORTANTE: Dashboard agrupa dados para visualização rápida
 * Evita múltiplas requisições ao frontend
 */

import veiculoRepository from "../repositories/veiculoRepository.js";
import rastreadorRepository from "../repositories/rastreadorRepository.js";
import chipRepository from "../repositories/chipRepository.js";
import userRepository from "../repositories/userRepository.js";

/**
 * Classe DashboardController
 * Métodos para obter dados agregados
 */
class DashboardController {
  /**
   * GET /dashboard
   * Retorna overview completo da plataforma
   *
   * RESPOSTA (200):
   * {
   *   "summary": {
   *     "totalUsers": 5,
   *     "totalVeiculos": 10,
   *     "totalRastreadores": 8,
   *     "totalChips": 10,
   *     "rastreadoresAtivos": 7,
   *     "rastreadoresDisponiveis": 2,
   *     "chipsDisponiveis": 3
   *   },
   *   "veiculosSemRastreador": [
   *     {
   *       "id": 1,
   *       "placa": "ABC-1234",
   *       "modelo": "Honda Civic",
   *       "usuario": "usuario@email.com"
   *     }
   *   ],
   *   "rastreadoresDisponiveis": [
   *     {
   *       "id": 1,
   *       "imei": "355234567890123",
   *       "modelo": "TK103",
   *       "protocolo": "GT06"
   *     }
   *   ],
   *   "chipsDisponiveis": [
   *     {
   *       "id": 1,
   *       "iccid": "89551234567890123456",
   *       "linha": "11999887766",
   *       "operadora": "Vivo"
   *     }
   *   ]
   * }
   *
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async getDashboard(req, res) {
    try {
      // Agregar dados de diferentes fontes
      const [
        allUsers,
        allVeiculos,
        allRastreadores,
        allChips,
        veiculosSemRastreador,
        rastreadoresDisponiveis,
        chipsDisponiveis,
      ] = await Promise.all([
        userRepository.findAll(),
        veiculoRepository.findAll(),
        rastreadorRepository.findAll(),
        chipRepository.findAll(),
        this.getVeiculosSemRastreador(),
        rastreadorRepository.findDisponiveis(),
        chipRepository.findDisponiveis(),
      ]);

      // Contar rastreadores ativos
      const rastreadoresAtivos = allRastreadores.filter((r) => r.ativo).length;

      // Montar resposta do dashboard
      const dashboard = {
        summary: {
          totalUsers: allUsers.length,
          totalVeiculos: allVeiculos.length,
          totalRastreadores: allRastreadores.length,
          totalChips: allChips.length,
          rastreadoresAtivos,
          rastreadoresDisponiveis: rastreadoresDisponiveis.length,
          chipsDisponiveis: chipsDisponiveis.length,
        },
        veiculosSemRastreador: veiculosSemRastreador.map((v) => ({
          id: v.id,
          placa: v.placa,
          modelo: v.modelo,
          usuario: v.usuario?.login,
        })),
        rastreadoresDisponiveis: rastreadoresDisponiveis.map((r) => ({
          id: r.id,
          imei: r.imei,
          modelo: r.modelo,
          protocolo: r.protocolo,
          ativo: r.ativo,
        })),
        chipsDisponiveis: chipsDisponiveis.map((c) => ({
          id: c.id,
          iccid: c.iccid,
          linha: c.linha,
          operadora: c.operadora,
          ativo: c.ativo,
        })),
      };

      return res.status(200).json(dashboard);
    } catch (error) {
      return res.status(500).json({
        error: error.message,
        code: "DASHBOARD_ERROR",
      });
    }
  }

  /**
   * GET /dashboard/user
   * Retorna dashboard personalizado para usuário autenticado
   * Mostra apenas seus veículos e rastreadores
   *
   * @param {Object} req - Requisição com req.user
   * @param {Object} res - Resposta
   */
  async getUserDashboard(req, res) {
    try {
      const userId = req.user.id;

      // Se for admin, retorna dashboard geral
      if (req.user.isAdmin) {
        return this.getDashboard(req, res);
      }

      // Se for usuário comum, retorna apenas seus dados
      const user = await userRepository.findWithVeiculos(userId);

      if (!user) {
        return res.status(404).json({
          error: "Usuário não encontrado",
          code: "NOT_FOUND",
        });
      }

      // Agregar dados do usuário
      const veiculos = user.veiculos || [];
      const rastreadores = [];
      const chips = [];

      // Coletar rastreadores e chips dos veículos
      for (const v of veiculos) {
        if (v.rastreador) {
          rastreadores.push(v.rastreador);
          if (v.rastreador.chip) {
            chips.push(v.rastreador.chip);
          }
        }
      }

      const userDashboard = {
        user: {
          id: user.id,
          login: user.login,
        },
        summary: {
          totalVeiculos: veiculos.length,
          totalRastreadores: rastreadores.length,
          totalChips: chips.length,
          veiculosSemRastreador: veiculos.filter((v) => !v.rastreadorId).length,
        },
        veiculos: veiculos.map((v) => ({
          id: v.id,
          placa: v.placa,
          modelo: v.modelo,
          ano: v.ano,
          cor: v.cor,
          rastreador: v.rastreador
            ? {
                id: v.rastreador.id,
                imei: v.rastreador.imei,
                modelo: v.rastreador.modelo,
                ativo: v.rastreador.ativo,
              }
            : null,
        })),
        rastreadores,
        chips,
      };

      return res.status(200).json(userDashboard);
    } catch (error) {
      return res.status(500).json({
        error: error.message,
        code: "DASHBOARD_ERROR",
      });
    }
  }

  /**
   * Método auxiliar: busca veículos sem rastreador
   * @private
   * @returns {Promise<Array>} Veículos desassociados
   */
  async getVeiculosSemRastreador() {
    try {
      const veiculos = await veiculoRepository.findAll();
      return veiculos.filter((v) => !v.rastreadorId);
    } catch (error) {
      return [];
    }
  }
}

export default new DashboardController();
