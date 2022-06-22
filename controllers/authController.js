const User = require("../models/User")
const {validationResult} = require("express-validator")
const nodemailer = require("nodemailer");
const {nanoid} = require("nanoid")

require("dotenv").config()

const registerForm = (req, res)=>{
    res.render("register")
}

const loginForm = (req, res) => {
    res.render("login");
};

const registerUser = async (req, res)=>{

    const errors = validationResult(req)
    if(!errors.isEmpty()){
        req.flash("mensajes", errors.array())
        return res.redirect("/auth/register")

    }
    const {userName, email, password} = req.body

    try {
        
        let user = await User.findOne({email:email})
        if(user) throw new Error("Ya existe el User")

        user = new User({userName, email, password, tokenConfirm: nanoid()})
        await user.save()

        //Enviar correo electronico con la confirmacion de la cuenta

        const transport = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: process.env.USERMAIL,
                pass: process.env.PASSEMAIL,
            },
        });

        await transport.sendMail({
            from: '"Fred Foo 👻" <foo@example.com>',
            to: user.email,
            subject: "verifique cuenta de correo",
            html: `<a href="${process.env.PATHHEROKU || 'http://localhost:5000'}/auth/confirmarCuenta/${user.tokenConfirm}">verificar cuenta aquí</a>`,
        });

        req.flash("mensajes", [
            { msg: "Revisa tu correo electrónico y valida cuenta" },
        ]);
        return res.redirect("/auth/login");
    } catch (error) {
        req.flash("mensajes", [{ msg: error.message }]);
        return res.redirect("/auth/register");
        // return res.json({ error: error.message });
    }
};

const confirmarCuenta = async(req, res) =>{
    const {token} = req.params;
    try {
        const user = await User.findOne({tokenConfirm:token})
        
        if(!user) throw new Error("No existe este Usuario")
        
        user.cuentaConfirmada = true
        user.tokenConfirm = null

        await user.save()

        req.flash("mensajes",[{msg:"Cuenta Verificada puede iniciar sesion"}])
        

        res.redirect("/auth/login")

    } catch (error) {
        req.flash("mensajes", [{ msg: error.message }]);
        res.redirect("/auth/login");
    }
}


const loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("mensajes", errors.array());
        return res.redirect("/auth/login");
    }

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) throw new Error("No existe este email");

        if (!user.cuentaConfirmada) throw new Error("Falta confirmar cuenta");

        if (!(await user.comparePassword(password)))
            throw new Error("Contraseña no correcta");

            req.login(user, function(err) {
                if (err) {
                    throw new Error("Error al crear la sesion");
                }
                return res.redirect("/");
            });
        
    } catch (error) {
        req.flash("mensajes", [{ msg: error.message }]);
        res.redirect("/auth/login");
    }
};

const cerrarSesion = (req, res, next) => {
    req.logout(function(err){
        if(err) {return next(err)}
        return res.redirect("/auth/login");
    });
};

module.exports = {
    loginForm,
    registerForm, 
    registerUser,
    confirmarCuenta,
    loginUser,
    cerrarSesion
}