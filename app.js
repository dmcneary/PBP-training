const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/fit-monkeys';
const isProduction = process.env.NODE_ENV === 'production';
const sessionSecret = process.env.SECRET || 'fraggle-rock';
const defaultMongoDbName = 'fit-monkeys';
const getMongoDbName = (uri) => {
	try {
		const parsed = new URL(uri);
		const dbName = parsed.pathname.replace(/^\//, '');
		return dbName || defaultMongoDbName;
	} catch (error) {
		return defaultMongoDbName;
	}
}
const mongoDbName = getMongoDbName(mongoUrl);

if (isProduction && !process.env.SECRET) {
	throw new Error('SECRET environment variable is required in production');
}

if (isProduction) {
	app.set('trust proxy', 1);
}

require('./models');
const passport = require('./passport');
const routes = require('./routes');

const createSessionStore = () => {
	if (typeof MongoStore.create === 'function') {
		return MongoStore.create({ mongoUrl, dbName: mongoDbName });
	}

	const LegacyMongoStore = MongoStore(session);
	return new LegacyMongoStore({ url: mongoUrl, dbName: mongoDbName });
}

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
	session({
		name: 'fit-monkeys.sid',
		secret: sessionSecret,
		store: createSessionStore(),
		resave: false, //required
		saveUninitialized: false, //required
		cookie: {
			httpOnly: true,
			sameSite: 'lax',
			secure: isProduction,
			maxAge: 1000 * 60 * 60 * 24 * 7
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
