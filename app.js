const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const session = require('express-session');
const dbConnection = require('./models');
const MongoStore = require('connect-mongo')(session);
const passport = require('./passport');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const routes = require('./routes');
const isProduction = process.env.NODE_ENV === 'production';
const sessionSecret = process.env.SECRET;

if (isProduction && !sessionSecret) {
	throw new Error('SECRET must be set in production.');
}

if (isProduction) {
	app.set('trust proxy', 1);
}

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
	session({
		secret: sessionSecret || 'dev-only-secret-change-me',
		store: new MongoStore({ mongooseConnection: dbConnection }),
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			sameSite: 'lax',
			secure: isProduction,
			maxAge: 1000 * 60 * 60 * 24 * 14
		}
	})
)
app.use(passport.initialize())
app.use(passport.session()) // calls the deserializeUser

if (isProduction) {
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
