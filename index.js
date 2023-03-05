process.env.FFMPEG_PATH = '/var/www/html/ffmpeg/ffmpeg';
const express = require('express');
const app = express();
const ffmpeg = require('fluent-ffmpeg');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Change the upload destination as needed



app.post('/upload', upload.single('file'), (req, res) => {
    const inputPath = req.file.path;
    const outputPath = `./converted/sd${Math.random()}as.mp4`;


    ffmpeg(inputPath)
        .output(outputPath)
        .addOptions([
            '-hwaccel', 'cuvid',
            '-c:v', 'h264_cuvid',
            '-resize', '1280x720',
            '-b:v', '1M',
            '-hwaccel_device', '0' // Move this option before the input file
        ])
        .videoBitrate(500)
        .on('end', () => {
            console.log('Video converted and saved successfully');
            res.send(outputPath);
        })
        .on('error', (error) => {
            console.error(`Error converting video: ${error.message}`);
            res.status(500).send('Error converting video');
        })
        .run();
});

app.listen(3000, () => {
    console.log('mdsjifhb');
})
