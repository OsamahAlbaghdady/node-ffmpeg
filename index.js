// // process.env.FFMPEG_PATH = '/var/www/html/website/node-ffmpeg/ffmpeg-master-latest-linux64-gpl/bin/ffmpeg';
// const express = require('express');
// const app = express();
// const ffmpeg = require('fluent-ffmpeg');
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' }); // Change the upload destination as needed



// app.post('/upload', upload.single('file'), (req, res) => {
//     const inputPath = req.file.path;
//     const outputPath = `./converted/sd${Math.random()}as.mp4`;


//     ffmpeg(inputPath)
//         .output(outputPath)
//         .videoBitrate(500)
//         .outputOptions([
//             '-c:v h264_nvenc'
//         ])
//         .on('end', () => {
//             console.log('Video converted and saved successfully');
//             res.send(outputPath);
//         })
//         .on('error', (error) => {
//             console.error(`Error converting video: ${error.message}`);
//             res.status(500).send('Error converting video');
//         })
//         .run();
// });

// app.listen(3000, () => {
//     console.log('mdsjifhb');
// })


const express = require('express');
const app = express();
const multer = require('multer');
const { exec } = require('child_process');

const upload = multer({ dest: 'uploads/' }); // Change the upload destination as needed

app.post('/upload', upload.single('file'), (req, res) => {
  const inputPath = req.file.path;
  const outputPath = `./converted/sd${Math.random()}as.mp4`;

  const command = `ffmpeg -i ${inputPath} -c:v h264_nvenc -b:v 500k ${outputPath}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error converting video: ${error.message}`);
      res.status(500).send('Error converting video');
      return;
    }
    console.log('Video converted and saved successfully');
    res.send(outputPath);
  });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

