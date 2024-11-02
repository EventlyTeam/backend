const path = require('path')
const fs = require('fs')

class ImageConverter {
    async getBase64(imageUrl) {
        if (!imageUrl) return null;

        const imageExtension = path.extname(imageUrl).slice(1);
        const imagePath = path.join(__dirname, '..', imageUrl);

        let base64Image = null;

        try {
            base64Image = await fs.promises.readFile(imagePath, { encoding: 'base64' });
        } catch (err) {
            console.error(`Error reading file: ${err.message}`);
        }

        const mimeType = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            gif: 'image/gif',
            bmp: 'image/bmp',
            webp: 'image/webp',
            svg: 'image/svg+xml'
        }[imageExtension.toLowerCase()];

        if (!mimeType) {
            console.warn(`Unsupported file type: ${imageExtension}`);
            return null;
        }

        return base64Image ? `data:${mimeType};base64,${base64Image}` : null;
    }
}

module.exports = new ImageConverter();