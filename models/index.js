//Connect to Mongo database
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
mongoose.set('strictQuery', false)
mongoose.set('sanitizeFilter', true)

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fit-monkeys' 
const defaultDbName = 'fit-monkeys'
const getDbName = (mongoUri) => {
    try {
        const parsed = new URL(mongoUri)
        const dbName = parsed.pathname.replace(/^\//, '')
        return dbName || defaultDbName
    } catch (error) {
        return defaultDbName
    }
}
const dbName = getDbName(uri)

mongoose.connect(uri, { dbName }).then(
    () => {},
    err => {
         console.error('Unable to connect to Mongo')
        }
  );


module.exports = mongoose.connection
