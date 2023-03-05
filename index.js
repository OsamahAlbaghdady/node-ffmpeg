// process.env.FFMPEG_PATH = '/var/www/html/ffmpeg/ffmpeg';
// const express = require('express');
// const app = express();
// const ffmpeg = require('fluent-ffmpeg');
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' }); // Change the upload destination as needed

// // Set the codec to a GPU-accelerated codec
// const codec = 'h264_nvenc';

// app.post('/upload', upload.single('file'), (req, res) => {
//     const inputPath = req.file.path;
//     const outputPath = `./converted/sd${Math.random()}as.mp4`;

//     ffmpeg(inputPath)
//         .output(outputPath)
//         .videoBitrate(500)
//         .withVideoCodec(codec) // Use GPU-accelerated codec
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



process.env.FFMPEG_PATH = '/var/www/html/ffmpeg/ffmpeg';
const express = require('express');
const app = express();
const ffmpeg = require('fluent-ffmpeg');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Change the upload destination as needed

//ffmpeg.setFfmpegPath('/var/www/html/ffmpeg/ffmpeg');
app.post('/upload', upload.single('file'), (req, res) => {
    const inputPath = req.file.path;
    const outputPath = `./converted/sd${Math.random()}as.mp4`;

    const command = ffmpeg(inputPath)
        .output(outputPath)
        .videoBitrate(500)
        .outputOptions('-f', 'mp4')
        .outputOptions('-c:v', 'h264')
        .outputOptions('-profile:v', 'baseline')
        .outputOptions('-level', '3.0')
        .outputOptions('-preset', 'superfast')
        .outputOptions('-crf', '22')
        .outputOptions('-strict', 'experimental')
        .outputOptions('-c:a', 'aac')
        .outputOptions('-b:a', '128k')
        .outputOptions('-f', 'mp4')
        .output('pipe:1')
        .on('end', () => {
            console.log('Video converted and saved successfully');
            res.send(outputPath);
        })
        .on('error', (error) => {
            console.log(error);
            console.error(`Error converting video: ${error.message}`);
            res.status(500).send('Error converting video');
        });

    console.log('FFmpeg command:', command.spawnArgs().join(' '));

    command.run();
});

app.listen(3000, () => {
    console.log('mdsjifhb');
})