const dotenv = require('dotenv')
dotenv.config()

let port = null

if (process.argv) {
    const idx = process.argv.indexOf('--port')
    if (idx > -1) port = process.argv[idx + 1]
}

const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const routes = require('./routes')
const AuthService = require('./services/AuthService')
const db = require('./services/Database')

const app = express()

app.use(helmet())
app.use(morgan('tiny'))
app.use(cors())
app.use(express.json())

//
// Register the routes
//
routes.forEach(r => {
    if (r.auth) app.use(r.path, (...args) => AuthService.RequiresAuth(...args), r.router)
    else app.use(r.path, r.router)
})

app.use((err, req, res, next) => {
    if (err.status) res.status(err.status)

    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
    })
})

start()

async function start () {
    await db.Setup()

    if (port !== null) {
        app.listen(port, () => {
            console.log(`Listening on http://localhost:${port}/`)
        })
    }
}

module.exports = app