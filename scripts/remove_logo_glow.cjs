const sharp = require('sharp');
const path = require('path');

const inputPath = path.resolve(__dirname, '../assets/images/ui/logo_title_with_cockroach.png');
const outputPath = path.resolve(__dirname, '../assets/images/ui/logo_title_with_cockroach_no_glow.png');

async function removeLogoGlow() {
  try {
    // Load the image
    const image = sharp(inputPath);

    // Get image metadata
    const metadata = await image.metadata();

    // Extract pixels
    const pixels = await image.raw().toBuffer();

    // Process pixels to remove glow (example: reduce alpha where color is close to orange)
    const processedPixels = Buffer.alloc(pixels.length);
    for (let i = 0; i < pixels.length; i += metadata.channels) {
      const red = pixels[i];
      const green = pixels[i + 1];
      const blue = pixels[i + 2];
      const alpha = pixels[i + 3];

      // Example: If the color is close to orange, reduce the alpha
      if (red > 200 && green > 100 && green < 200 && blue < 50) {
        processedPixels[i] = red;
        processedPixels[i + 1] = green;
        processedPixels[i + 2] = blue;
        processedPixels[i + 3] = Math.max(0, alpha - 50); // Reduce alpha, but not below 0
      } else {
        processedPixels[i] = red;
        processedPixels[i + 1] = green;
        processedPixels[i + 2] = blue;
        processedPixels[i + 3] = alpha;
      }
    }

    // Create a new image from the processed pixels
    await sharp(processedPixels, {
        raw: {
            width: metadata.width,
            height: metadata.height,
            channels: metadata.channels
        }
    })
    .toFile(outputPath);

    console.log(`Successfully removed glow from logo at ${outputPath}`);
  } catch (error) {
    console.error('Error removing glow from logo:', error);
  }
}

removeLogoGlow();