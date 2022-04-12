const express = require("express");
const router = express.Router();

router.get("/", (req,res)=>{
    const urls = [
        {origin: "www.google.com/bluuweb", shortURL:"DFSDFS1"},
        {origin: "www.google.com/bluuweb2", shortURL:"DFSDFS2"},
        {origin: "www.google.com/bluuweb3", shortURL:"DFSDFS3"},
        {origin: "www.google.com/bluuweb4", shortURL:"DFSDFS4"},
    ]

    res.render("home", {urls: urls})
})



module.exports = router