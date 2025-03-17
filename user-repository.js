import crypto from 'node:crypto';

import bcrypt from 'bcrypt';
import DBLocal from 'db-local';

import { saltRounds } from './config.js';


const { Schema } = new DBLocal({ path: './db'});

// Creacion del schema de usuarios
const User = Schema('Users', {
    _id: { type: String, require: true },
    username: { type: String, require: true },
    password: { type: String, require: true }
})

export class UserRepository {
    static async create ({username, password}) {
        // Validar nombres de usuarios (Probar la biblioteca zod despues)
        if (typeof username !== 'string') throw new Error('El usuario tiene que ser una cadena de texto.');
        if (username.length < 3) throw new Error('El usuario tiene que ser mayor a 3 caracteres.');

        // Validar la contraseña
        if(typeof password !== 'string') throw new Error('La contraseña tiene que ser una cadena de texto.');
        if(password.length < 8) throw new Error('La contraseña tiene que tener mayor a 8 caracteres.');

        // Validar que no se repitan los usuarios
        const user = User.findOne({ username });
        if (user) throw new Error('El usuario ya existe.');

        // Generacion del ID con randomUUID
        const id = crypto.randomUUID();

        //Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        User.create({
            _id: id,
            username,
            password: hashedPassword
        }).save();

        return id;
    }

    static login ({username, password}) {}
}