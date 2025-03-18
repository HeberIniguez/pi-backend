import express from 'express';
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser';

import { PORT, SECRET_KEY } from './config.js';
import { UserRepository } from './user-repository.js';

const app = express();

//Middlewares
app.use(express.json());
app.use(cookieParser());

// recuperar la session y pasar a la siguiente ruta
app.use((req, res, next) => {
    const token = req.cookies.access_token;
    req.session = { user: null };

    try {
        const data = jwt.verify(token, SECRET_KEY);
        req.session.user = data;
    } catch {}

    next();
})

app.get('/', (req, res) => {
    const { user } = req.session;
    if ( !user ) res.send('<h1> Bienvenido al Proyecto Integrador </h1>');
    res.send(`<h1> Hola ${user.username} </h1>`);
})

//EndPoints
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try{
        const user = await UserRepository.login({ username, password });
        const token = jwt.sign({ user: user._id, username: user.username }, 
        SECRET_KEY, {
            expiresIn: '1h',
        })
        res
        .cookie('access_token', token, {
            httpOnly: true, // cookie solo accesible desde el servidor
            sameSite: 'strict', // solo accesible desde el mismo dominio
            maxAge: 1000 * 60 * 60
        })
        .send({ user, token })
    }catch (error) {
        res.status(401).send(error.message);
    }
});

app.post('/register', async (req, res) => {
    const {username, password } = req.body;
    console.log({ username, password });

    try { 
        const id = await UserRepository.create({ username, password });
        res.send({ id, username });
    } catch (error) {
        res.status(400).send(error.message);
    }
})

app.post('/logout', (req, res) => {
    res
    .clearCookie('access_token')
    .json({ message: 'Ha cerrado session'})
});

app.get('/protected', (req, res) => {
    const { user } = req.session;
    if (!user) return res.status(403).send('Acceso no autorizado');
    res.send(`<h1>Pagina de ${ user.username }</h1>`);
});

app.listen(PORT, () => {
    console.log(`Server corriendo en http://localhost:${PORT}`);
})