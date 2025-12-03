const fs = require('fs');
const toIco = require('to-ico');

async function createFavicon() {
  try {
    const buffers = await Promise.all([
      fs.promises.readFile('public/favicon-16.png'),
      fs.promises.readFile('public/favicon-32.png')
    ]);

    const icoBuffer = await toIco(buffers);
    await fs.promises.writeFile('public/favicon.ico', icoBuffer);
    
    console.log('ICO file created successfully!');
  } catch (error) {
    console.error('Error creating ICO file:', error);
  }
}

createFavicon();