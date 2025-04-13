// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import express from 'express';
// import multer from 'multer';

// const router = express.Router();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// router.post('/postImage/:id', upload.single('image'), (req, res) => {
//     const { id } = req.params;
//     const imageBuffer = req.file?.buffer;

//     if (!imageBuffer) {
//         return res.status(400).send({ error: 'No image uploaded' });
//     }

//     const dirPath = path.join(__dirname, '..', 'images', req.pathType+'Post');
//     console.log(req.pathType);
//     const filePath = path.join(dirPath, `${id}.png`);

//     // Ensure the directory exists
//     fs.mkdir(dirPath, { recursive: true }, (mkdirErr) => {
//         if (mkdirErr) {
//             console.error('Failed to create directory:', mkdirErr);
//             return res.status(500).send({ error: 'Failed to create directory' });
//         }

//         fs.writeFile(filePath, imageBuffer, (writeErr) => {
//             if (writeErr) {
//                 console.error('Error writing file:', writeErr);
//                 return res.status(500).send({ error: 'Error saving image' });
//             }

//             res.send({ message: 'Image saved successfully' });
//         });
//     });
// });


// router.get('/getImage/:id', (req, res) => {
//     const { id } = req.params;
//     const filePath = path.join(__dirname, '..', 'images', req.pathType+'Post', `${id}.png`);

//     fs.access(filePath, fs.constants.F_OK, (err) => {
//         if (err) {
//             return res.status(404).send({ error: 'Image not found' });
//         }

//         res.sendFile(filePath);
//     });
// });


// export default router;
