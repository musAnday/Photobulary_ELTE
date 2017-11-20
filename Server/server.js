const express = require('express');
const request = require('request');
const Vision = require('@google-cloud/vision');
const Datastore = require('@google-cloud/datastore');
const bodyParser = require('body-parser');

const fs = require('fs');

const keyfile = {
    projectId: 'photobulary-elte',
    keyFilename: 'Photobulary-Elte-45bfdaf4b523.json'
}

const vision = Vision(keyfile);
const datastore = Datastore(keyfile);

var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

//API ENDPOINTS

/**
 * Processes the image though API and matches "words" in the game with results of image "image64Base" sent to API returns array of object.
 * @param {string} image64Base
 * @param {array[string]} words
 * @return {array[Object]} result
 */
app.post("/processimage", (req, res) => {

    var errors = [];

    var image64Base = req.body.image64Base;
    var words = req.body.words;

    if (!words || words.length == 0) {
        errors.push("Words are required.");
    }

    try {
        isValidBase64Image(image64Base);
    } catch (e) {
        errors.push(e.message);
    }

    if (errors.length != 0) {
        res.status(400).send({
            errorMessage: errors
        })
    }


    let requests = [];

    let requestObj = {
        image: { content: image64Base },
        features: { type: 'LABEL_DETECTION' }
    };

    requests.push(requestObj);
    vision.batchAnnotateImages({ requests: requests }).then((results) => {
        var labelledResults = results[0].responses[0].labelAnnotations;
        res.send(matchResults(labelledResults, words));
    }).catch(function (reason) {
        // rejection
        res.status(400).send({
            errorMessage: reason
        })
    });
});

/**
 * Processes the image though API using image "image64Base" returns array of definitive words. 
 * @param {string} image64Base
 * @return {array[string]} result
 */
app.post("/getwordsfromimage", (req, res) => {

    var image64Base = req.body.image64Base;
    isValidBase64Image(image64Base);

    let requests = [];

    let requestObj = {
        image: { content: image64Base },
        features: { type: 'LABEL_DETECTION' }
    };

    requests.push(requestObj);
    vision.batchAnnotateImages({ requests: requests }).then((results) => {
        var labelledResults = results[0].responses[0].labelAnnotations;
        var resultc = getDescriptions(labelledResults);
        res.send(resultc);

    }).catch(function (reason) {
        // rejection
        console.log(reason);
        res.status(400).send({
            errorMessage: reason
        })
    });

});

/**
 * Processes the image though API using image "image64Base" returns array of definitive words. 
 * @param {array[string]} words
 * @return status code
 */
app.post("/insertWords", (req, res) => {
    var words = req.body.words;
    if (!words) {
        "words are required."
    }
    words.length
    var count = 0;
    
    words.forEach(element => {
        console.log(element)
        const kind = 'Words';
        const name = element;
        const wordKey = datastore.key([kind, name]);
        datastore.save({
            key: wordKey,
            data: {
                Word : element 
            }
        }).then(() => {
            count++;
            if (count == words.length) {
                console.log("Words are successfully inserted into dictionary");
                res.sendStatus(200);
            }
        }).catch((error) => {
            console.log(error);
            res.sendStatus(500);
        });
    });
})

/**
 * Processes the image though API using image "image64Base" returns array of definitive words. 
 * @param {number} words
 * @return {array[string]} words
 */
app.get("/getRandomWords", (req, res) => {
    var randomWordNum = req.query.num_words;

    const query = datastore.createQuery('Words');

    datastore.runQuery(query)
    .then((results) => {
      // Task entities found.
      const WordsResult = results[0];


      var words = [];
      var resultsToReturn = [];
      WordsResult.forEach((Word) => words.push(Word.Word));
      for (let index = 0; index < randomWordNum; index++) {
        var indexToTake = Math.floor(Math.random() * words.length);
        console.log(indexToTake);
        resultsToReturn.push(words.splice(indexToTake,1)[0]);
      }
      res.send(resultsToReturn);
      
    });
});


//STARTING APP

app.listen(3000);


//INTERNAL OPERATIONS

function getDescriptions(labelledResults) {
    var descriptions = [];
    labelledResults.forEach(element => { descriptions.push(element.description) });
    return descriptions;
}

function matchResults(APIResults, words) {
    return APIResults.diff(words);
}

Array.prototype.diff = function (arr2) {
    var ret = [];
    this.sort();
    arr2.sort();
    for (var i = 0; i < this.length; i += 1) {
        if (arr2.indexOf(this[i].description) > -1) {
            ret.push(this[i]);
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

    if (!dataString) {
        throw new Error("image64Base is required");
    }

    return true;
}
