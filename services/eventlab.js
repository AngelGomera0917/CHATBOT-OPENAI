const fs = require("node:fs");
const path = require("path");

/**
 * Convierte texto a audio usando ElevenLabs API
 * @param {string} text - El texto a convertir en audio
 * @param {string} voiceId - ID de la voz (por defecto: 'vwfl76D5KBjKuSGfTbLB')
 * @returns {string} - Ruta del archivo de audio generado
 */
const convertTextToVoice = async (text, voiceId = "vwfl76D5KBjKuSGfTbLB") => {
  const EVENT_TOKEN = process.env.EVENT_TOKEN ?? "";

  if (!EVENT_TOKEN) {
    throw new Error("EVENT_TOKEN no está configurado en las variables de entorno.");
  }

  const URL = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const header = new Headers();
  header.append("accept", "audio/mpeg");
  header.append("xi-api-key", EVENT_TOKEN);
  header.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    text,
    model_id: "eleven_multilingual_v1",
    voice_settings: {
      stability: 1,
      similarity_boost: 0.8,
    },
  });

  const requestOptions = {
    method: "POST",
    headers: header,
    body: raw,
    redirect: "follow",
  };

  const response = await fetch(URL, requestOptions);

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`Error en la API: ${response.status} - ${errorDetails}`);
  }

  const buffer = await response.arrayBuffer();

  const tmpDir = path.join(process.cwd(), "tmp");
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
  }

  const pathFile = `${tmpDir}/${Date.now()}-audio.mp3`;
  fs.writeFileSync(pathFile, Buffer.from(buffer));

  return pathFile;
};

module.exports = { convertTextToVoice };
