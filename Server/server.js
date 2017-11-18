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

//API ENDPOINTS

app.post("/processimage", (req, res) => {

    var errors = [];

    var image64Base = req.body.image64Base;
    var words = req.body.words;

    if (!words || words.length == 0 ){
        errors.push("Words are required.");
    }

    if(!image64Base)
    {
        errors.push("'image64Base' is required.");
    }

    try{
        var valid = isValidBase64Image(image64Base)
    }catch(e){
            errors.push(e.message);
    }

    if (errors.length != 0){
        res.status(505)
        res.send({
            errorMessage : errors
        })
    }


    let requests = [];

    let requestObj = {
        image: {content: image64Base},
        features: {type: 'LABEL_DETECTION'}
      };
    
      requests.push(requestObj);
      vision.batchAnnotateImages({requests: requests}).then((results) => 
      { 
        var labelledResults = results[0].responses[0].labelAnnotations;
        res.send(matchResults(labelledResults,words));
      }).catch(function(reason) {
        // rejection
        res.status(505)
        res.send({
            errorMessage : reason
        })
     });
});

//STARTING APP

app.listen(3000);


//INTERNAL OPERATIONS

function matchResults(APIResults, words){
    return APIResults.diff(words);
}

Array.prototype.diff = function(arr2) {
    var ret = [];
    this.sort();
    arr2.sort();
    for(var i = 0; i < this.length; i += 1) {
        if(arr2.indexOf( this[i].description ) > -1){
            ret.push( this[i] );
        }
    }
    return ret;
};

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
  
    if (!matches) {
      return new Error("image64Base is not a valid image data.");
    }

    return true;
  }
