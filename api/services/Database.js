const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { Err, Log } = require('./LoggerService')

const VERSION = 1

class DatabaseService {
    Models = {}

    async Setup () {
        Log('DatabaseService: Running Setup')
        const {
            MONGODB_SERVER,
            MONGO_USERNAME,
            MONGO_PASSWORD,
            MONGO_DB_NAME,
        } = process.env

        await mongoose.connect(`mongodb://${MONGODB_SERVER}/${MONGO_DB_NAME}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
            authSource: 'admin',
            user: MONGO_USERNAME,
            pass: MONGO_PASSWORD
        })

        Log('DatabaseService: Mongo connected')

        this.SetupSchemas()
        await this.AddSeedData()

        Log('DatabaseService: Setup complete')
    }

    SetupSchemas () {
        Log('DatabaseService: Setting up Schemas')
        const Schema = mongoose.Schema
        const ObjectId = Schema.ObjectId

        for (let type in Schemas) {
            const raw = Schemas[type]
            raw.author = ObjectId
            const schema = new Schema(raw)
            this.Models[type] = mongoose.model(type, schema)

            schema.pre('save', function (next) {
                // VERSION is used to keep track of when the schema changes.
                // In the future, setup a system to migrate older versions to newer versions. 
                this.version = VERSION
                next()
            })
        }
    }

    async AddSeedData () {
        Log('DatabaseService: Adding seed data')
        for (let type in SeedData) {
            const model = this.Models[type]
            const seeds = SeedData[type]
            for (let i = 0; i < seeds.length; i++) {
                try {
                    const shouldSeed = await seeds[i].check(model)
                    if (!shouldSeed) continue
                    const record = await seeds[i].record()
                    await model.create(record)
                } catch (err) {
                    Err(`Error trying to seed data for ${type} on index ${i}.`)
                    Err(err)
                }
            }
        }
    }
}

const Schemas = {
    User: {
        version: Number,
        username: String,
        password: String
    }
}

const SeedData = {
    User: [
        {
            async check (model) {
                const rec = await model.findOne({ username: 'admin' })
                return !rec
            },
            async record () {
                const password = 'password'
                const saltRounds = 10
                const salt = await bcrypt.genSalt(saltRounds)
                const hash = await bcrypt.hash(password, salt)

                return {
                    username: 'admin',
                    password: hash
                } 
            }
        }
    ]
}

module.exports = (new DatabaseService())