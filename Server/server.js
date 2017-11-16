const express = require('express');
const request = require('request');
const Vision = require('@google-cloud/vision');
const bodyParser = require('body-parser');

const fs = require('fs');

const vision = Vision(
    {
        projectId: 'photobulary-elte',
        keyFilename: 'Photobulary-Elte-45bfdaf4b523.json'
    }
);

var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.post("/test", (req, res) => { console.log(req.body) });

app.post("/processimage", (req, res) => {

    var image64Base = req.body.image64Base;

    if(!image64Base && !isValidBase64Image(image64Base))
    {
        res.status(505)
        res.send({
            errorMessage : "'image64Base' is required."
        })
    }


    let requests = [];

    let requestObj = {
        image: {content: image64Base},
        features: {type: 'LABEL_DETECTION'}
      };
    
      requests.push(requestObj);
      vision.batchAnnotateImages({requests: requests}).then((results) => { res.send(results) });
});

app.listen(3000);

function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

function isValidBase64Image(dataString) {

    if(!dataString)
    {
        return new Error("image64Base is required");
    }

    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  
    if (matches.length !== 3) {
      return new Error("image64Base is not a valid image data.");
    }

    return true;
  }
