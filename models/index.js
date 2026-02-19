//Connect to Mongo database
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
mongoose.set('strictQuery', false)

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fit-monkeys' 

mongoose.connect(uri).then(
    () => {console.log('Connected to Mongo');},
    err => {
         console.log('error connecting to Mongo: ')
         console.log(err);
        }
  );


module.exports = mongoose.connection
