const express = require('express');
const cors = require('cors');
const multer = require('multer');
const libreofficeConvert = require('libreoffice-convert');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Configure Multer to handle file uploads
const upload = multer({ dest: 'uploads/' });

// Enable CORS to allow cross-origin requests from the frontend
app.use(cors());

// Serve the frontend HTML file
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to handle file upload and conversion
app.post('/convert', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  if (req.file.mimetype !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return res.status(400).json({ error: 'Invalid file type. Only DOCX files are allowed' });
  }

  const inputPath = req.file.path;
  const outputPath = `${inputPath}.pdf`;

  const options = {
    format: 'pdf',
    output: outputPath,
  };

  libreofficeConvert.convert(inputPath, options, (err, result) => {
    if (err) {
      console.error('Conversion error:', err);
      return res.status(500).json({ error: 'Error converting file' });
    }

    console.log('Conversion successful');
    fs.readFile(outputPath, (err, data) => {
      if (err) {
        console.error('Error reading converted file:', err);
        return res.status(500).json({ error: 'Error reading converted file' });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${req.file.originalname}.pdf`);
      res.send(data);

      // Cleanup: delete the temporary input and output files
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
