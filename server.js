const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');

// Carregar variáveis de ambiente (apenas em ambiente local)
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

// Verificar se as variáveis de ambiente estão definidas
if (!process.env.PRIVATE_KEY) {
  console.error('A variável de ambiente PRIVATE_KEY não foi definida.');
  process.exit(1); // Encerra o servidor se a chave não estiver configurada
}

// Log para depuração
console.log('PRIVATE_KEY carregada:', process.env.PRIVATE_KEY);

// A função abaixo trata a chave privada, removendo possíveis quebras de linha extras
const privateKey = process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY.replace(/\\n/g, '\n') : null;

if (!privateKey) {
  console.error('A chave privada não foi definida corretamente.');
  process.exit(1); // Encerra o servidor se a chave privada estiver ausente ou incorreta
}

const sheets = google.sheets('v4');

// Configuração de autenticação com a API do Google Sheets
const auth = new google.auth.GoogleAuth({
  credentials: {
    type: process.env.TYPE || 'service_account',
    project_id: process.env.PROJECT_ID || 'gs-moon',
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.privateKey,
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'], // Permissões necessárias
});

// ID da sua planilha (vindo de variáveis de ambiente)
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
