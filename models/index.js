//Connect to Mongo database
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
mongoose.set('strictQuery', false)
mongoose.set('sanitizeFilter', true)

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pbp-planner' 

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(
    () => {console.log('Connected to Mongo');},
    err => {
         console.error('Unable to connect to Mongo')
        }
  );


module.exports = mongoose.connection
