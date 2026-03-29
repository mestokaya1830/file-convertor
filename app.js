import express from 'express'
const app = express()
import helmet from 'helmet'
import multer from 'multer'
import fs from 'fs'
import dotenv from 'dotenv'
import path from 'path'
import csvToJson from 'csvtojson'
import { json2csv } from 'csv42'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()
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
  await fs.promises.mkdir(path.resolve('./dist/uploads/', req.params.imagepath), {
    recursive: true
  })
const targetName = path.parse(req.files[0].filename).name
  try {
    const result = await csvToJson().fromFile(`./dist/${req.files[0].filename}`)
    await fs.promises.writeFile(`./dist/uploads/${req.params.imagepath}/${targetName}.json`,JSON.stringify(result),'utf-8')
    res.json({ code: 200, filename: `${targetName}.json` })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Conversion failed' })
  }

})

app.post('/api/convert/json-csv/:imagepath', target.array('files'), async (req, res) => {
  await fs.promises.mkdir(path.resolve('./dist/uploads/', req.params.imagepath), {
    recursive: true
  })
  try {
    const targetName = req.files[0].filename.split('.')[0]
    const data = JSON.parse(await fs.promises.readFile(`./dist/${req.files[0].filename}`, 'utf-8'))
    const final = json2csv(data, { flatten: true })
    await fs.promises.writeFile(`./dist/uploads/${req.params.imagepath}/${targetName}.csv`, final, 'utf-8')
    res.json({ code: 200, filename: `${targetName}.csv` })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Conversion failed' })
  }
})

app.post('/api/remove-images', async (req, res) => {
  const imagePath = path.resolve('./dist/uploads/', req.body.imagepath)
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
