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
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCxKj8nBcd96tH3\nRgf4wBeCedZzWXEZJn1nRdSJovftgTikYC+52vq5qTBfLOayV3HHZEiayZmnM6Ds\nNP3kYR2sppVlEbG/N2OS8vbgc8APXf1949PfYA/Ezkm4BLX66SU+4q3qEfGEzDl/\ngeyG6Hr6HzttkldniiDyiIxVHeUfdt+5t7+qLbuzNE717TIHFHNNVNMlTLP2nsK/\nDAVr9Xzmx1SB4fvd4G8zDo10awqiJfvc/1aVYxxMS6XM6uP8u0d2Z0NnP4ckJC0l\ns3HYCkDUeOZwpIQ0drTaFxzQP+v4Tuhf0tHs0FyrrSI6pIsLBeLj4G3/nfbvZTxV\nE55sh7kHAgMBAAECggEAEUZqG6DLCWwsRrN9c4DHluFqfjTqe+YhtEA+FgdEeNQ9\nqBZfXcmmFeFGTJsd1tk2YjFVIw+LyNH8wj7CKWxbof1cWk6VyZ9zbJDK1RGni9gO\nYu6KnYb9NdbBOXOI8Ys3JodtjeiezeQo3Yk9sKn0OkKkkm3PazkwA6ls7AY0oUY8\njm9zWiK6WXolGvXiY7RRkOo+tG0/L3JcBXSXwhmE8iN35dGrSVhGpvGgXpKAqyUJ\nIdJjgMzPH6iAMSzzc2SS8Xk3Cb+LyGu/OYeoWKs9q07aY3kZBCheVmC5C1f+fqpJ\nf1UUzk4IW8KzwiPdr9E3kTx3knwsj9zKrG1DIbKDgQKBgQDc0p0sri8xRdCIRtxw\nAnD4lL+q6oNls4qNapJspNhHoCz1rDyDw25Z6IgxjzbQgTZ4MH578DfRUKhOiLA1\n6sZU3ZDSHTHfJqi8D1RxOhTOfIWVz9iZRzPiN9rPVdDXGIHWAG1jxGT48esjWWmy\nAJTjg+FH2ZYPF59mTLMuFY5j8wKBgQDNYznIDneAtWHIJVTOUzVHfadgLLgchxZQ\nEMPNtaD2w4KCWzlb2CfcJgsAW6q1B/dKe1QodVdEEuuE5mDzywBb/DZfvIWNAcuj\n5YKxYZCP0mKdMaRyaGX5yFioAurHDRXxTFo9b/cbzVANTLvxwzXciV6OSF1R43K6\n3wmKyf4fnQKBgF71939aXJMM2dNw3aURd7F+jjoa5Wyb3A5acSNldFjA6fSwH8nu\nBguF8uOVGdZqapkfCZWUxPwvemFjaJuXHbkrGvcwdNzozBEran3So1X0uKGnIxcv\nRoGW0XLuDYQiVttHjcMkluNzbVHjRo+0rlJ0yTFTwbM1zmd4vmkn/fa/AoGBAJ16\nuXEldoefi6v0w8O3lSCNvepGH5zwDzGwyRFPdG4Alm7xF1fOszFfkgviPU+1He1k\nBrFG13SAtUkfg7MqMcpV5jMdz6DAga3XapAraLZ979Lrn1WBqr8M2L1qDy40YGC1\n1HNLCEOu9vRbo7fJn+DLC085OSRyqyORpDVgj5MZAoGAS4cM4VWD6i/8DsXDs+8B\nuB3JC+PYiBxZslPn+2YxtcuhAKq7T1iz5Yfr3MVg4yJyfg8YZSu8Zos25PsdTy0Y\nyKtyD6qaKSgkgI7iChWPWYqI6A+Pr589qpLggdE1joaGa5J25julzvyHQyRWal+z\n+y8Z3XCUNe/BX7VRZOApDyo=\n-----END PRIVATE KEY-----",
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
