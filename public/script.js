document.getElementById('uploadButton').addEventListener('click', async () => {
    const videoInput = document.getElementById('videoInput');
    const resultsDiv = document.getElementById('results');

    if (!videoInput.files.length) {
        resultsDiv.innerHTML = `<p style="color: red;">Por favor, selecione um arquivo de vídeo.</p>`;
        return;
    }

    const videoFile = videoInput.files[0];
    const formData = new FormData();
    formData.append('video', videoFile);

    resultsDiv.innerHTML = "Processando vídeo, por favor aguarde...";

    try {
        const response = await fetch('/analyze-video', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        if (response.ok) {
            resultsDiv.innerHTML = `
                <h3>Resultados da Análise:</h3>
                <p><strong>Objetos:</strong> ${data.objects.join(', ')}</p>
                <p><strong>Rótulos:</strong> ${data.labels.join(', ')}</p>
            `;
        } else {
            resultsDiv.innerHTML = `
                <p style="color: red;">Erro ao processar o vídeo: ${data.error}</p>
                <p>Detalhes: ${JSON.stringify(data.details || data.message)}</p>
            `;
        }
    } catch (error) {
        resultsDiv.innerHTML = `<p style="color: red;">Erro: ${error.message}</p>`;
    }
});
