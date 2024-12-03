const express = require('express');
const multer = require('multer');
const path = require('path');
const { VideoIntelligenceServiceClient } = require('@google-cloud/video-intelligence');
require('dotenv').config();

const app = express();
const port = 3000;

// Configuração de upload de arquivos
const upload = multer({ dest: 'uploads/' });

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota para análise de vídeo
app.post('/analyze-video', upload.single('video'), async (req, res) => {
    const videoFilePath = req.file?.path; // Verificar se o arquivo foi enviado

    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo foi enviado.' });
    }

    try {
        console.log(`Arquivo recebido: ${req.file.originalname}`);
        
        // Simulando upload para o Google Cloud Storage (substituir com a integração real)
        const gcsUri = `gs://fake-bucket/${req.file.filename}`;
        console.log(`Simulando upload para: ${gcsUri}`);

        // Inicializar o cliente do Video Intelligence API
        const client = new VideoIntelligenceServiceClient();

        console.log('Enviando solicitação para a API Video Intelligence...');
        const [operation] = await client.annotateVideo({
            inputUri: gcsUri,
            features: ['LABEL_DETECTION', 'OBJECT_TRACKING'],
        });

        const operationName = operation.name;
        console.log(`Operação iniciada: ${operationName}`);

        // Consultar resultado da operação
        console.log('Aguardando resultados da operação...');
        let operationResult;
        let isComplete = false;

        while (!isComplete) {
            operationResult = await client.getOperation({ name: operationName });

            if (operationResult.done) {
                isComplete = true;
            } else {
                console.log('Ainda processando... tentando novamente em 5 segundos.');
                await new Promise(resolve => setTimeout(resolve, 5000)); // Aguardar 5 segundos
            }
        }

        console.log('Análise concluída. Extraindo resultados...');
        const annotations = operationResult.response.annotationResults[0];
        const labels = annotations.segmentLabelAnnotations.map(label => label.entity.description);
        const objects = annotations.objectAnnotations.map(obj => obj.entity.description);

        res.json({ labels, objects });
    } catch (error) {
        console.error('Erro durante o processamento:', error.message);

        if (error.response) {
            console.error('Detalhes do erro da API:', error.response.data);
            res.status(500).json({
                error: 'Erro ao processar o vídeo.',
                details: error.response.data,
            });
        } else {
            res.status(500).json({ error: 'Erro interno no servidor.', message: error.message });
        }
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
