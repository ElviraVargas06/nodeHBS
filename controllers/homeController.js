const Url= require("../models/Url")
const{nanoid} = require("nanoid")

const leerUrls = async (req,res)=>{
    
    try{
        const urls = await Url.find({user: req.user.id}).lean() 
        res.render("home", {urls: urls})
    }catch(error){
        console.log(error)
        req.flash("mensajes", [{msg:error.message}])
        return res.redirect("/")
    }
    
}

const agregarUrl = async (req, res) => {
    const { origin } = req.body;

    try {
        const url = new Url({
            origin: origin,
            shortURL: nanoid(8),
            user: req.user.id,
        });
        await url.save();
        req.flash("mensajes", [{ msg: "se agregó url correctamente" }]);
        return res.redirect("/");
    } catch (error) {
        req.flash("mensajes", [{ msg: error.message }]);
        return res.redirect("/");
    }
};

const eliminarUrl = async (req, res) => {
    const { id } = req.params;
    try {
        const url = await Url.findById(id);
        if (!url.user.equals(req.user.id)) {
            throw new Error("no se puede eliminar url");
        }
        await url.remove();

        req.flash("mensajes", [{ msg: "se eliminó url correctamente" }]);
        return res.redirect("/");
    } catch (error) {
        req.flash("mensajes", [{ msg: error.message }]);
        return res.redirect("/");
    }
};

const editarUrlForm = async (req, res) => {
    const { id } = req.params;
    try {
        const url = await Url.findById(id).lean();
        if (!url.user.equals(req.user.id)) {
            throw new Error("no se puede editar url");
        }
        return res.render("home", { url: url });
    } catch (error) {
        req.flash("mensajes", [{ msg: error.message }]);
        return res.redirect("/");
    }
};

const editarUrl = async (req, res) => {
    const { id } = req.params;
    const { origin } = req.body;
    try {
        const url = await Url.findById(id);
        if (!url.user.equals(req.user.id)) {
            throw new Error("no se puede editar url");
        }
        await url.updateOne({ origin });
        req.flash("mensajes", [{ msg: "se editó url correctamente" }]);
        res.redirect("/");
    } catch (error) {
        req.flash("mensajes", [{ msg: error.message }]);
        return res.redirect("/");
    }
};

const resdireccionamiento = async(req, res) =>{
    const {shortURL} = req.params
    try{
        const urlDB = await Url.findOne({shortURL: shortURL})
        res.redirect(urlDB.origin)
    }catch (error){
        req.flash("mensajes", [{msg:"No existe esta url configurada"}])
        return res.redirect("/auth/login")
    }
}
module.exports = {
    leerUrls,
    agregarUrl,
    eliminarUrl,
    editarUrlForm,
    editarUrl,
    resdireccionamiento,
}