const sharp = require('sharp');
const fs = require('fs');

// Convert SVG to ICO
async function generateFavicon() {
  try {
    // First, let's create a higher resolution PNG from our SVG
    await sharp('public/favicon.svg')
      .resize(64, 64)
      .png()
      .toFile('public/favicon-64.png');
    
    // Then create ICO from the PNG
    await sharp('public/favicon-64.png')
      .resize(32, 32)
      .png()
      .toFile('public/favicon-32.png');
      
    await sharp('public/favicon-64.png')
      .resize(16, 16)
      .png()
      .toFile('public/favicon-16.png');
    
    console.log('Favicon files generated successfully!');
  } catch (error) {
    console.error('Error generating favicon:', error);
  }
}

generateFavicon();