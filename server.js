const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');

const app = express();

app.use(cors({
  origin: [
    'https://moonguild.vercel.app',
    'https://moonguild-jefersonmarcianos-projects.vercel.app',
    'https://moonguild-m06az0lhe-jefersonmarcianos-projects.vercel.app',
  ],
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(bodyParser.json());

const sheets = google.sheets('v4');

const auth = new google.auth.GoogleAuth({
  credentials: {
    type: process.env.TYPE || 'service_account',
    project_id: process.env.PROJECT_ID || 'gs-moon',
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'], // Permissões necessárias
});

const spreadsheetId = process.env.SPREADSHEET_ID;
const rangeName = process.env.RANGE_NAME || 'A2:B2';

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});