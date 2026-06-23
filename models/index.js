//Connect to Mongo database
const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pbp-planner' 

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(
    () => {console.log('Connected to Mongo');},
    err => {
         console.log('error connecting to Mongo: ')
         console.log(err);
        }
  );


module.exports = mongoose.connection
