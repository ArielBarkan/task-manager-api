const express   = require('express');
const errorsRouters   = new express.Router();

errorsRouters.use((req, res)=>{

    const str   = {
        "message" : "404 page not found",
        "method"   : req.method,
        "body"      :req.body,
        "params"    : req.params
    }
    console.log(req.method)
    res.status(404).send(str);
})


module.exports  = errorsRouters;