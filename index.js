process.env.FFMPEG_PATH = '/var/www/html/website/node-ffmpeg/ffmpeg-master-latest-linux64-gpl/bin/ffmpeg';
const express = require('express');
const app = express();
const ffmpeg = require('fluent-ffmpeg');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Change the upload destination as needed
const image = require('imagemagick')
const fs = require('fs')
const sizeOf = require('image-size');


app.post('/upload', upload.single('file'), (req, res) => {
    const inputPath = req.file.path;
    const outputPath = `./converted/sd${Math.random()}as.mp4`;
    const outputPathThub = `./converted/thub/sd${Math.random()}as.jpg`;


    ffmpeg(inputPath)
        .screenshots({
            count: 1,
            timemarks: ['00:00:01'],
            filename: outputPathThub
        })
        .on('end', () => {
            const dimensions = sizeOf(outputPathThub);
            console.log(dimensions.width, dimensions.height);
            // image.resize({
            //     srcPath : outputPathThub , 
            //     dstPath : outputPathThub , 
            //     width : 300 ,
            // } , function (err) {
            //     if(err) throw err;
            //     console.log('resized');
            // })
            console.log('Thumbnail generated successfully');
        })
        .on('error', (err) => {
            console.error('Error generating thumbnail: ', err);
        });





    ffmpeg(inputPath)
        .output(outputPath)
        .videoBitrate(500)
        .outputOptions([
            '-c:v h264_nvenc',
            '-s 480x854',
            '-pix_fmt yuv420p',
            `-vf zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p`
        ])
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
