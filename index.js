import express from 'express'
import { PORT } from './config.js'

const app = express()

app.get('/', (req, res) => {
    res.send('Hola')
})

app.listen(PORT, () => {
    console.log(`Server corriendo en http://localhost:${PORT}`)
})