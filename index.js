process.env.FFMPEG_PATH = '/var/www/html/ffmpeg/ffmpeg';
const express = require('express');
const app = express();
const ffmpeg = require('fluent-ffmpeg');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Change the upload destination as needed

ffmpeg.setFfmpegPath('/var/www/html/ffmpeg/ffmpeg');
app.post('/upload', upload.single('file'), (req, res) => {
    const inputPath = req.file.path;
    const outputPath = `./converted/sd${Math.random()}as.mp4`;

    ffmpeg(inputPath)
        .output(outputPath)
        .inputOption([
            "-vsync 0",
            "-hwaccel cuvid",
            "-hwaccel_device 0"
        ])
        .outputOptions("-c:v h264_cuvid")
        .videoCodec("h264_nvenc")
        .videoBitrate(500)
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