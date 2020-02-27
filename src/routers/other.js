const express = require('express');
const otherRouters = new express.Router();

const multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '.jpg') //Appending .jpg
    }
})

const upload = multer({
    storage
})

testRouters.post('/upload', upload.single('upload'), (req, res) => {
    console.log("hereeeee");
    res.status(200).send()
})

module.exports = otherRouters;