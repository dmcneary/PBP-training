const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const session = require('express-session');
require('./models');
const MongoStore = require('connect-mongo');
const passport = require('./passport');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/fit-monkeys';
const routes = require('./routes');

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
	session({
		secret: process.env.SECRET || 'fraggle-rock', 
		store: MongoStore.create({ mongoUrl }),
		resave: false, //required
		saveUninitialized: false //required
	})
)
app.use(passport.initialize())
app.use(passport.session()) // calls the deserializeUser

if (process.env.NODE_ENV === 'production') {
	// Serve any static files
	app.use(express.static(path.join(__dirname, 'client/dist')));
	}

// Routes
app.use(routes)
	
if (require.main === module) {
  app.listen(PORT, function () {
    console.log(`🌎 ==> API server now on port ${PORT}!`);
  });
}

module.exports = app;
