const passport = require('passport')
const LocalStrategy = require('./localStrategy')
const User = require('../models/user')

// called on login, saves the id to session req.session.passport.user = {id:'..'}
passport.serializeUser((user, done) => {
	done(null, user._id)
})

// user object attaches to the request as req.user
passport.deserializeUser((id, done) => {
	const userId = id && id._id ? id._id : id
	User.findOne(
		{ _id: userId },
		'username',
		(err, user) => {
			done(null, user)
		}
	)
})

//  Use Strategies 
passport.use(LocalStrategy)

module.exports = passport
