/*

TODO:
- Setup password standards.

*/

const { Cache } = require('memory-cache')
const { v4: guid } = require('uuid')
const bcrypt = require('bcrypt')
const { Log, Err } = require('./LoggerService')
const DatabaseService = require('./Database')

const cacheTime = 30 * 60 * 1000
const authReg = /(?<=Bearer )[a-zA-Z0-9-]+/

class AuthService {
    static cache = new Cache()
    static instanceId = guid()

    static async GetUser (username) {
        return { username }
        username = username.toLowerCase()
        const { User } = DatabaseService.Models
        const user = await User.findOne({ username })
        if (!user) return null
        return user
    }

    static GetPublicUser (user) {
        return {
            username: user.username
        }
    }

    static async CheckUser (user, password) {
        return true
        return await bcrypt.compare(password, user.password)
    }

    static async ChangePassword (req, res, next) {
        try {
            const header = req.headers.authorization
            if (!header || !authReg.test(header)) throw new Error('No Authorization header set.')

            const token = authReg.exec(header)[0]
            const user = AuthService.cache.get(token)

            if (!user) {
                Err(`Change Password Failed: User not found. Token: ${token}`)
                return res.status(401).send({ message: 'Authorization failed' })
            }

            const { oldPassword, newPassword } = req.body
            if (!oldPassword || !newPassword) {
                Err('Change Password Failed: oldPassword or newPassword not set.')
                return res.status(400).send({ message: '`oldPassword` and `newPassword` parameters are required.' })
            }

            const goodPass = await AuthService.CheckUser(user, oldPassword)

            if (!goodPass) {
                // Keep this error the same as above to not let bad actors know if they found a good username.
                Err('Change Password Failed: Password incorrect.')
                return res.status(401).send({ message: 'Authorization failed' })
            }

            const saltRounds = 10
            const salt = await bcrypt.genSalt(saltRounds)
            const hash = await bcrypt.hash(newPassword, salt)

            user.password = hash
            await user.save()

            return await AuthService.Logout(req, res, next)
        } catch (err) {
            next(err)
        }
    }

    static async Login (req, res, next) {
        try {
            const { username, password } = req.body
            if (!username || !password) {
                Err('Login Failed: username or password not set.')
                return res.status(400).send({ message: '`username` and `password` parameters are required.' })
            }

            const user = await AuthService.GetUser(username)

            if (!user) {
                Err(`Login Failed: User '${username}' not found.`)
                return res.status(401).send({ message: 'Authorization failed' })
            }

            const goodPass = await AuthService.CheckUser(user, password)

            if (!goodPass) {
                // Keep this error the same as above to not let bad actors know if they found a good username.
                Err('Login Failed: Password incorrect.')
                return res.status(401).send({ message: 'Authorization failed' })
            }

            const token = guid()
            AuthService.cache.put(token, user, cacheTime)

            // Can't return the user record above as that has the password on it.
            const returnUser = AuthService.GetPublicUser(user)

            Log(`Login Success: User ${user.username} logged in. Token: ${token}`)

            return res.status(200).send({ token, user: returnUser })
        } catch (err) {
            next(err)
        }
    }

    static Logout (req, res, next) {
        try {
            const header = req.headers.authorization
            if (!header || !authReg.test(header)) throw new Error('No Authorization header set.')

            const token = authReg.exec(header)[0]
            const user = AuthService.cache.get(token)
            if (!user) return res.sendStatus(200)

            Log(`Logging out ${user.username}. Deleting token ${token}`)
            AuthService.cache.del(token)

            return res.sendStatus(200)
        } catch (err) {
            next(err)
        }
    }

    static User (req, res, next) {
        try {
            const header = req.headers.authorization
            if (!header || !authReg.test(header)) return res.sendStatus(401)

            const token = authReg.exec(header)[0]
            const user = AuthService.cache.get(token)
            if (!user) return res.sendStatus(401)

            // Refresh cache time
            AuthService.cache.put(token, user, cacheTime)

            const publicUser = AuthService.GetPublicUser(user)

            return res.status(200).send({ user: publicUser })
        } catch (err) {
            next(err)
        }
    }

    static Verify (req, res, next) {
        try {
            const header = req.headers.authorization
            if (!header || !authReg.test(header)) return res.sendStatus(401)

            const token = authReg.exec(header)[0]
            const user = AuthService.cache.get(token)
            if (!user) return res.sendStatus(401)

            // Refresh cache time
            AuthService.cache.put(token, user, cacheTime)

            return res.sendStatus(200)
        } catch (err) {
            next(err)
        }
    }

    static RequiresAuth (req, res, next) {
        try {
            const header = req.headers.authorization
            if (!header || !authReg.test(header)) {
                Err('Auth Failed: Authorization header was not set.')
                return res.sendStatus(401)
            }

            const token = authReg.exec(header)[0]
            const user = AuthService.cache.get(token)

            Log(`REQUEST: ${req.originalUrl} - Token: ${token} - User Found: ${!!user} - Instance ID ${AuthService.instanceId}`)
            if (!user) {
                const keys = AuthService.cache.keys()
                Err(`Auth Failed: User is not logged in. Token: ${token}`)
                Err(`Available Tokens: ${keys.join(', ')}`)
                return res.sendStatus(401)
            }

            // Refresh cache time
            AuthService.cache.put(token, user, cacheTime)

            req.user = user

            next()
        } catch (err) {
            next(err)
        }
    }
}

Log(`AuthSerice created ${AuthService.instanceId}`)

module.exports = AuthService
