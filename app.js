import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import helmet from 'helmet'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import csvToJson from 'csvtojson'
import { json2csv } from 'csv42'
import { fileURLToPath } from 'url'
const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true, limit: '3mb' }))
app.use(express.static('dist'))

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
  })
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'dist/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const fileFilter = function (req, file, cb) {
  const types = ['text/csv', 'application/json']
  if (!types.includes(file.mimetype)) {
    const error = new Error('Wrong file type')
    error.code = 'LIMIT_FILE_TYPES'
    return cb(error, false)
  }
  cb(null, true)
}
const target = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1e7 //10 mb
    // fileSize: 5e+6 //5 mb
  }
})

app.post('/api/convert/csv-json/:imagepath', target.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const uploadDir = path.resolve('./dist/uploads/', req.params.imagepath)
    await fs.promises.mkdir(uploadDir, { recursive: true })

    const file = req.files[0]
    const targetName = path.parse(file.filename).name

    const result = await csvToJson().fromFile(file.path)

    const outputPath = `${uploadDir}/${targetName}.json`

    await fs.promises.writeFile(
      outputPath,
      JSON.stringify(result, null, 2),
      'utf-8'
    )

    res.json({ code: 200, filename: `${targetName}.json` })

  } catch (error) {
    console.error("REAL ERROR:", error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/convert/:type/:imagepath', target.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const uploadDir = path.resolve('./dist/uploads/', req.params.imagepath)
    await fs.promises.mkdir(uploadDir, { recursive: true })

    const file = req.files[0]
    const targetName = file.filename.split('.')[0]

    const raw = await fs.promises.readFile(file.path, 'utf-8')

    let data
    try {
      data = JSON.parse(raw)
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON file' })
    }

    const final = json2csv(data, { flatten: true })

    const outputPath = `${uploadDir}/${targetName}.csv`
    await fs.promises.writeFile(outputPath, final, 'utf-8')

    res.json({ code: 200, filename: `${targetName}.csv` })

  } catch (error) {
    console.error("REAL ERROR:", error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/remove-images', async (req, res) => {
  const imagePath = path.resolve('./dist/uploads/', String(req.body.imagepath))
  try {
    await fs.promises.access(imagePath)
    await fs.promises.rm(imagePath, { recursive: true, force: true })
    res.json({ code: 200 })
  } catch {
    res.status(400).json({ code: 400, message: 'Sorry no images to remove!' })
  }
})


app.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_TYPES') {
    return res.status(415).json({ error: 'Wrong file type!' })
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large! Max 10 MB' })
  }

  console.error(error)
  res.status(500).json({ error: 'Unexpected server error' })
})


app.listen(3000, () => {
  console.log('Server is running...')
})
