const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://sankhya-pdv.s3.amazonaws.com/';
const outputPath = path.join(__dirname, 'public', 'data.xml');

https.get(url, (response) => {
  if (response.statusCode !== 200) {
    console.error(`Failed to get '${url}' (${response.statusCode})`);
    return;
  }

  const file = fs.createWriteStream(outputPath);
  response.pipe(file);

  file.on('finish', () => {
    file.close();
    console.log('Downloaded XML file to', outputPath);
  });
}).on('error', (err) => {
  console.error('Error fetching the XML:', err.message);
});
