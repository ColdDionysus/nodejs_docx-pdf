const express = require('express')
const cors = require('cors')
const fs = require('fs')
const libreoffice = require('libreoffice-convert')
const path = require('path')
const multer = require('multer')

const PORT = process.env.PORT || 3500
const app = express()
app.use(cors())


app.use('/', express.static(path.join(__dirname, 'public')))

const upload = multer({ dest: 'uploads/' })

app.post('/convert', upload.single('file'), (req, res)=> {
  if(!req.file){
    return res.status(400).json({ error: "No file Uploaded" })

  }
  if (req.file.mimetype !== 'application/vnd.openxmlformats-officedocumet.wordprocessingml.document'){
    return res.status(400).json({ error: "Invalid File Type. Only docx files are allowed"})
  }
  const inputPath = req.file.path
  const outputPath = `${inputPath}.pdf`

  const options = {
    format: 'pdf',
    output: outputPath
  }

  libreoffice.convert(inputPath, options, (err, result)=> {
    if(err){
      console.error('Conversion error:',err)
      return res.status(500).json({ error: 'Error Converting file' })
    }
    console.log('Conversion Successful')
    fs.readFile(outputPath, (err, data)=> {
      if(err){
        console.error('Error Reading converted file:', err)
        return res.status(500).json({error: 'Error reading converted file'})
      }
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename=${req.file.originalname}.pdf`)
      res.send(data)
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    })
  })
})









app.listen(PORT, () => {console.log(`Server started at ${PORT}`)})