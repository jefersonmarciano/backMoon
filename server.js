const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');
const path = require('path');
require('dotenv').config(); // Importa o dotenv para usar variáveis de ambiente

// Criação do servidor Express
const app = express();

// Configuração do middleware
app.use(cors({
  origin: [
    'https://moonguild.vercel.app',
    'https://moonguild-jefersonmarcianos-projects.vercel.app',
    'https://moonguild-m06az0lhe-jefersonmarcianos-projects.vercel.app'
  ],
  methods: ['GET', 'POST'],
  credentials: true
})); // Permite o CORS
app.use(bodyParser.json()); // Permite que o servidor entenda JSON no corpo da requisição

// Configuração do Google Sheets API
const sheets = google.sheets('v4');
const auth = new google.auth.GoogleAuth({
  credentials: {
    TYPE: process.env.GOOGLE_TYPE,
    PROJECT_ID: process.env.GOOGLE_PROJECT_ID,
    PRIVATE_KEY_ID: process.env.GOOGLE_PRIVATE_KEY_ID,
    PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Substitui os caracteres de nova linha no valor da variável
    GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    AUTH_URI: process.env.GOOGLE_AUTH_URI,
    TOKEN_URI: process.env.GOOGLE_TOKEN_URI,
    AUTH_PROVIDER_X509_CERT_URL: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL,
    CLIENT_X509_CERT_URL: process.env.GOOGLE_CLIENT_CERT_URL,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'], // Permissões necessárias
});

// ID da sua planilha (vindo de variáveis de ambiente)
const spreadsheetId = process.env.GOOGLE_SHEET_ID;

// Endpoint para atualizar o Google Sheets
app.post('/update-gs', async (req, res) => {
  const { playerName, cleanGs } = req.body;

  // Verifica se os dados necessários foram enviados
  if (!playerName || !cleanGs) {
    return res.status(400).json({ success: false, message: 'Nome do jogador e GS são obrigatórios' });
  }

  try {
    // Chama a função que vai atualizar o Google Sheets
    await updateGoogleSheet(playerName, cleanGs);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar o GS:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar a requisição' });
  }
});

// Função para atualizar o Google Sheets
async function updateGoogleSheet(playerName, cleanGs) {
  try {
    const client = await auth.getClient();

    // Chama a API do Google Sheets para atualizar a planilha
    const response = await sheets.spreadsheets.values.append({
      auth: client,
      spreadsheetId: spreadsheetId, // Usando a variável correta
      range: 'A2:B2', // A célula onde você quer inserir os dados
      valueInputOption: 'RAW', // Formato do valor (RAW ou USER_ENTERED)
      requestBody: {
        values: [[playerName, cleanGs]], // Dados a serem inseridos
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
const PORT = process.env.PORT || 5000; // Porta vindo das variáveis de ambiente ou padrão 5000
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
