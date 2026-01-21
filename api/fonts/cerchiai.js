import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  // Obtenemos el nombre de la fuente desde la URL: /api/fonts/MiFuente-Light
  const { font } = req.query;

  // Lista de fuentes permitidas
  const fonts = {
    'Cerchiai-Light': 'Cerchiai-Light.woff2',
    'Cerchiai-Regular': 'Cerchiai-Regular.woff2',
    'Cerchiai-Bold': 'Cerchiai-Bold.woff2'
  };

if (!fonts[font]) {
    return res.status(404).send('Fuente no encontrada');
  }

  // Construimos la ruta al archivo dentro de la raíz (/fonts)
  const filePath = path.join(process.cwd(), 'fonts', fonts[font]);

  try {
    const fontData = fs.readFileSync(filePath);

    // Headers: tipo de archivo y cache
    res.setHeader('Content-Type', 'font/woff2');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // cache 1 año

    res.send(fontData);
  } catch (err) {
    res.status(500).send('Error al leer la fuente');
  }
}