process.env.FFMPEG_PATH = '/var/www/html/ffmpeg/ffmpeg';
const express = require('express');
const app = express();
const { exec } = require('child_process');
const ffmpeg = require('fluent-ffmpeg');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Change the upload destination as needed

ffmpeg.setFfmpegPath('/var/www/html/ffmpeg/ffmpeg');
app.post('/upload', upload.single('file'), (req, res) => {
    const inputPath = req.file.path;
    const outputPath = `./converted/sd${Math.random()}as.mp4`;

    ffmpeg(inputPath).videoCodec('h264_nvenc')
    .videoBitrate(500)
    .videoFilters(`scale=${targetWidth}:${targetHeight}`)
        .output(outputPath)
        .on('end', () => {
            console.log('Video converted and saved successfully');
            res.send(outputPath);
        })
        .on('error', (error) => {
            console.log(error);
            console.error(`Error converting video: ${error.message}`);
            res.status(500).send('Error converting video');
        })
        .run();
});


app.listen(3000, () => {
    console.log('mdsjifhb');
})