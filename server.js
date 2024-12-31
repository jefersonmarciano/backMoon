const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config(); // Carrega variáveis de ambiente em desenvolvimento
}

// Criação do servidor Express
const app = express();

// Configuração do middleware
app.use(cors({
  origin: [
    'https://moonguild.vercel.app',
    'https://moonguild-jefersonmarcianos-projects.vercel.app',
    'https://moonguild-m06az0lhe-jefersonmarcianos-projects.vercel.app',
  ],
  methods: ['GET', 'POST'],
  credentials: true,
}));
app.use(bodyParser.json()); // Permite entender JSON no corpo da requisição

// Configuração do Google Sheets API
if (!process.env.PRIVATE_KEY) {
  console.error('A variável de ambiente PRIVATE_KEY não foi definida.');
  process.exit(1); // Encerra o servidor se a chave não estiver configurada
}

const privateKey = process.env.PRIVATE_KEY.replace(/\\n/g, '\n'); // Substitui as quebras de linha

const sheets = google.sheets('v4');
const auth = new google.auth.GoogleAuth({
  credentials: {
    TYPE: process.env.TYPE,
    PROJECT_ID: process.env.PROJECT_ID,
    PRIVATE_KEY_ID: process.env.PRIVATE_KEY_ID,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    CLIENT_EMAIL: process.env.CLIENT_EMAIL,
    CLIENT_ID: process.env.CLIENT_ID,
    AUTH_URI: process.env.AUTH_URI,
    TOKEN_URI: process.env.TOKEN_URI,
    AUTH_PROVIDER_X509_CERT_URL: process.env.AUTH_PROVIDER_X509_CERT_URL,
    CLIENT_X509_CERT_URL: process.env.CLIENT_X509_CERT_URL,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'], // Permissões necessárias
});

// ID da sua planilha (vindo de variáveis de ambiente)
if (!process.env.SPREADSHEET_ID) {
  console.error('A variável de ambiente SPREADSHEET_ID não foi definida.');
  process.exit(1); // Encerra o servidor se a ID da planilha não estiver configurada
}
const spreadsheetId = process.env.SPREADSHEET_ID;
const rangeName = process.env.RANGE_NAME || 'A2:B2';

// Endpoint para atualizar o Google Sheets
app.post('/update-gs', async (req, res) => {
  const { playerName, cleanGs } = req.body;

  if (!playerName || !cleanGs) {
    return res.status(400).json({ success: false, message: 'Nome do jogador e GS são obrigatórios.' });
  }

  try {
    await updateGoogleSheet(playerName, cleanGs);
    res.json({ success: true, message: 'Dados atualizados com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar o GS:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar a requisição.' });
  }
});

// Função para atualizar o Google Sheets
async function updateGoogleSheet(playerName, cleanGs) {
  try {
    const client = await auth.getClient();
    const response = await sheets.spreadsheets.values.append({
      auth: client,
      spreadsheetId,
      range: rangeName,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[playerName, cleanGs]],
      },
    });

    console.log(`Dados atualizados para o jogador ${playerName} com o GS ${cleanGs}`);
    return response;
  } catch (error) {
    console.error('Erro ao atualizar a planilha:', error);
    throw new Error('Erro ao atualizar o Google Sheets');
  }
}

// Inicia o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
