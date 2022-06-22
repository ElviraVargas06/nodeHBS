const express = require("express")
const session = require("express-session")
const MongoStore = require("connect-mongo");
const flash = require("connect-flash")
const passport = require("passport")
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const csrf = require("csurf");


const { create } = require("express-handlebars");

require("dotenv").config()
const clientDB = require("./database/db");

const app = express()

const corsOptions = {
    credentials: true,
    origin: process.env.PATHHEROKU || "*",
    method:["GET", "POST"]
};

app.use(cors(corsOptions));

app.use(
    
    session({
    secret: process.env.SECRETSESSION,
    resave: false,
    saveUninitialized: false,
    name: "secret-name",
    store: MongoStore.create({
        clientPromise: clientDB,
        dbName: process.env.DBNAME,
    }),

    cookie: { secure: process.env.MODO === "production" ? true:false, maxAge: 30 * 24 * 60 * 60 * 1000 },
})

)

app.use(flash());

/*PASSPORT PARA TENER SESIONES ACTIVAS*/

app.use(passport.initialize())
app.use(passport.session())


passport.serializeUser(
    (user, done) => done(null, { id: user._id, userName: user.userName }) //se guardará en req.user
);

// no preguntar en DB???
passport.deserializeUser(async (user, done) => {
    return done(null, user); //se guardará en req.user
});

// preguntar en DB por el usuario???
passport.deserializeUser(async (user, done) => {
    const userDB = await User.findById(user.id).exec();
    return done(null, { id: userDB._id, userName: userDB.userName }); //se guardará en req.user
});

/*FLASH SOLO VIVE UNA SOLA VEZ EN EL NAVEGADOR
app.use(flash());

app.get("/mensaje-flash", (req, res) => {
    res.json(req.flash("mensaje"));
});

app.get("/campos-validados", (req, res) => {
    req.flash("mensaje", "todos los campos fueron validados");
    res.redirect("/mensaje-flash");
});

FIN FLASH */

/*SESIONES

app.get("/ruta-protegida", (req, res)=>{
    res.json(req.session.usuario || "Sin sesión de usuario")
})

app.get("/crear-session", (req, res)=>{
    req.session.usuario = "Elvis"
    res.redirect("/ruta-protegida")
})

app.get("/destruir-session", (req, res) => {
    req.session.destroy();
    res.redirect("/ruta-protegida");
});

FIN  DE SESIONES*/


const hbs = create({
    extname: ".hbs",
    partialsDir: ["views/components"],
});

//Motor de Plantilla
app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", "./views");

//Fin motor de plantilla

app.use(express.static(__dirname + "/public"))
// capturar body
app.use(express.urlencoded({extended: false}))

//csrf Protection

app.use(csrf());

app.use(mongoSanitize());

app.use((req, res, next) =>{
    res.locals.csrfToken = req.csrfToken()
    res.locals.mensajes = req.flash("mensajes")
    next()
})

//app.use(express.json());
app.use("/", require("./routes/home"))
app.use("/auth", require("./routes/auth"))

const PORT = process.env.PORT ||5000;
app.listen(PORT, () => console.log("server andando 🔥"));