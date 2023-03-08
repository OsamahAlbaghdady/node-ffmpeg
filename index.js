require('dotenv').config()
process.env.FFMPEG_PATH = '/var/www/html/website/node-ffmpeg/ffmpeg-master-latest-linux64-gpl/bin/ffmpeg';
const express = require('express');
const app = express();
const ffmpeg = require('fluent-ffmpeg');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Change the upload destination as needed
const sizeOf = require('image-size');
const sharp = require('sharp')
const fs = require('fs')
const AWS = require('aws-sdk');
const axios = require('axios')
const js = require('circular-json')
AWS.config.update({
    accessKeyId: "AKIARPZAGPO7TU2NAENX",
    secretAccessKey: "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",
})

const s3 = new AWS.S3();
app.use(express.json());

app.post('/upload', upload.array('file[]'), async (req, res) => {
    var data = [];
    await Promise.all(await req.files.map(async (file, index) => {
        // console.log(file);
        if (file.mimetype.includes('video')) {
            const inputPath = file.path;
            const outputPath = `./converted/sd${Math.random()}as.mp4`;
            const outputPathThub = `./converted/thub/sd${Math.random()}as.jpg`;
            const outputPathNewThubWhite = `./converted/thub/white/new${Math.random()}as.jpg`;
            const outputPathNewThubDark = `./converted/thub/dark/new${Math.random()}as.jpg`;


            let width, height;

            let o = new Promise((res, rej) => {
                ffmpeg(inputPath)
                    .screenshots({
                        count: 1,
                        timemarks: ['00:00:01'],
                        filename: outputPathThub
                    })
                    .on('end', async () => {
                        var rt = res(await sizeOf(outputPathThub));
                        sharp(outputPathThub)
                            .resize(500, 500, {
                                kernel: sharp.kernel.nearest,
                                fit: 'contain',
                                background: 'white'
                            })
                            .toFile(outputPathNewThubWhite)
                            .then(() => {
                                sharp(outputPathThub)
                                    .resize(500, 500, {
                                        kernel: sharp.kernel.nearest,
                                        fit: 'contain',
                                        background: 'black'
                                    })
                                    .toFile(outputPathNewThubDark)
                                    .then(() => {
                                        fs.unlink(outputPathThub, function (err) {
                                            if (err) return console.log(err);
                                            console.log('file deleted successfully');
                                        });

                                    });
                            });

                        return rt;
                    })

                console.log('Thumbnail generated successfully');
            })



            width = (await o).width
            height = (await o).height


            var newWidth;
            var newHeight;

            if (width > height) {
                if (width < 854) {
                    newWidth = width;
                    newHeight = height;
                } else {
                    newWidth = 854;
                    newHeight = parseInt((height / width) * 854);
                    if (newHeight != 480)
                        newHeight = 480;
                }
            } else {
                if (height < 854) {
                    newWidth = width;
                    newHeight = height;
                } else {
                    newWidth = parseInt((width / height) * 854);
                    newHeight = 854;
                }
            }


            let l = new Promise((res, rej) => {
                ffmpeg(inputPath)
                    .output(outputPath)
                    .videoBitrate(500)
                    .outputOptions([
                        '-c:v h264_nvenc',
                        `-s ${newWidth}x${newHeight}`,
                        '-pix_fmt yuv420p',
                        `-vf zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p`
                    ])
                    .on('end', async () => {
                        console.log('Video converted and saved successfully');
                        data[index] = {

                            url: outputPath,
                            darkThumbnail: outputPathNewThubDark,
                            lightThumbnail: outputPathNewThubWhite,
                            type: 'video'

                        };
                        fs.unlink(inputPath, () => { })
                        // res.write(outputPath);
                        return res(data)

                    })
                    .on('error', (error) => {
                        console.error(`Error converting video: ${error.message}`);
                        res.status(500).send('Error converting video');
                    })
                    .run();
            })
            data = await l;
        } else if (file.mimetype.includes('image')) {
            const outputPath = `./images/sd${Math.random()}as.jpg`;
            var l = new Promise((res, rej) => {
                fs.rename(file.path, outputPath, (e) => {
                    res({
                        'url': outputPath,
                        'type': 'image'
                    })
                    fs.unlink(file.path, () => { })
                })


            })
            data[index] = await l
        }
    })).then(async () => {
        var dataToSend = [];
        Promise.all(
            data.map(async (d, index) => {
                console.log(d);
                if (d.type == "image") {
                    imageUrl = uploadToS3(d.url, 'image/' + d.url.replace('./', ''));
                    dataToSend[index] = {
                        imageUrl: await imageUrl,
                        type: 'image'
                    }
                }
                if (d.type == "video") {
                    videoUrl = await uploadToS3(d.url, 'video/' + d.url.replace('./converted/', 'video/mp4'));
                    videoWhiteThumb = await uploadToS3(d.lightThumbnail, 'whiteThumbnail/' + d.lightThumbnail.replace('./converted/thub/white/', 'image/jpeg'));
                    videoDarkThumb = await uploadToS3(d.darkThumbnail, 'darkThumbnail/' + d.darkThumbnail.replace('./converted/thub/dark/', 'image/jpeg'));

                    dataToSend[index] = {
                        videoUrl: videoUrl,
                        videoWhiteThumb: videoWhiteThumb,
                        videoDarkThumb: videoDarkThumb,
                        type: 'video'
                    }
                }
            })
        ).then(async () => {
            dataToSend[dataToSend.length] = { description: req.body.description }
           
            var hh = await axios.post('https://test.azu-app.com/api/home/posts/store' , dataToSend , {
               headers : {
                  accept : 'application/json'
               }
            })
            // console.log(hh);
           res.json(hh.data)
           
        })
    })
});




async function uploadToS3(file, path, type) {
    var data;
    const imageBuffer = fs.readFileSync(file);
    const params = {
        Bucket: 'post-upload-video',
        Key: path,
        Body: imageBuffer,
        ContentType: type,
        ACL: 'public-read',
    };


    data = new Promise((res, rej) => {
        s3.upload(params, (err, data) => {
            if (err) {
                console.error(err);
            } else {
                console.log(`Image uploaded successfully. File URL: ${data.Location}`);
                res(data.Location)
            }
        })
    })

    d = await data
    fs.unlink(file , ()=>{})
    return d

}
app.listen(3000, () => {
    console.log('mdsjifhb');
})




//https://flaviocopes.com/node-aws-s3-upload-image/