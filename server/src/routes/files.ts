import { Router } from 'express'
import multer from 'multer'
import { cloudinary } from '../lib/cloudinary.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

router.post('/upload', upload.single('file'), async (req: any, res: any) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    if (!req.file.mimetype?.startsWith('image/')) return res.status(400).json({ error: 'Only image uploads are allowed' })
    const buffer = req.file.buffer
    const uploadStream = cloudinary.uploader.upload_stream({ folder: 'nextswap/users' }, (error, result) => {
      if (error || !result) return res.status(500).json({ error: error?.message || 'Upload failed' })
      return res.json({ secure_url: result.secure_url, public_id: result.public_id })
    })
    uploadStream.end(buffer)
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Upload failed' })
  }
})

export default router
