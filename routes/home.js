const express = require("express");
const { 
    leerUrls, 
    agregarUrl, 
    eliminarUrl,
    editarUrlForm,
    editarUrl,
    resdireccionamiento,
    
 } = require("../controllers/homeController");

const { perfilForm, cambiarFotoPerfil } = require("../controllers/perfilController");

const urlValidar = require("../middlewares/urlValida")
const verificarUser = require("../middlewares/verificarUser");
const router = express.Router();

router.get("/", verificarUser, leerUrls);
router.post("/", verificarUser, urlValidar, agregarUrl);
router.get("/eliminar/:id", verificarUser, eliminarUrl);
router.get("/editar/:id", verificarUser, editarUrlForm);
router.post("/editar/:id", verificarUser, urlValidar, editarUrl);
router.get("/perfil", verificarUser, perfilForm);
router.post("/perfil", verificarUser, cambiarFotoPerfil);
router.get("/:shortURL", resdireccionamiento);

module.exports = router