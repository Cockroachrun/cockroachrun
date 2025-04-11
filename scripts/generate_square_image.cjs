const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, '../assets/images/characters', 'American Cockroach with bg.png');
const outputPath = path.resolve(__dirname, '../assets/images/characters/american-cockroach-square.png');
const width = 256;
const height = 256;

async function generateSquareImage() {
  try {
    await sharp(inputPath)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFile(outputPath);
    console.log(`Successfully generated square image at ${outputPath}`);
  } catch (error) {
    console.error('Error generating square image:', error);
  }
}

generateSquareImage();