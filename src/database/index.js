// Importa a classe Sequelize (ORM que conversa com o banco)
import { Sequelize } from "sequelize";

// Carrega automaticamente as variáveis do arquivo .env (ambiente local)
// No Railway isso não é obrigatório, mas não atrapalha
import "dotenv/config";

/*
  No Railway, o banco PostgreSQL fornece uma variável chamada:

  process.env.DATABASE_URL

  Ela já vem no formato completo:
  postgresql://usuario:senha@host:porta/nomeDoBanco

  Em produção usamos essa string completa
*/

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  // Define qual banco estamos usando
  dialect: "postgres",

  // Define o protocolo da conexão
  protocol: "postgres",

  // Desativa logs SQL no console (mais limpo em produção)
  logging: false,

  /*
    Railway exige conexão segura (SSL).
    Sem isso pode dar erro como:
    - no pg_hba.conf entry
    - self signed certificate
  */
  dialectOptions: {
    ssl: {
      require: true, // força uso de SSL
      rejectUnauthorized: false, // aceita certificado do Railway
    },
  },
});

/*
  Exportamos a instância da conexão.
  Agora qualquer parte do projeto pode importar e usar o banco.
*/
export default sequelize;
