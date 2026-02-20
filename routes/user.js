const express = require('express')
const router = express.Router()
const User = require('../models/user')
const passport = require('../passport')

const serializeUser = (user) => {
	if (!user) return null
	return {
		_id: user._id,
		username: user.username,
		firstName: user.firstName,
		lastName: user.lastName,
		location: user.location,
		clubRegionIds: Array.isArray(user.clubRegionIds) ? user.clubRegionIds : []
	}
}

const requireAuth = (req, res, next) => {
	if (req.user) {
		return next()
	}
	return res.status(401).json({ error: 'Unauthorized' })
}

router.post('/', (req, res) => {
    console.log('user signup');

    const { username, password, firstName, lastName, gender, age, location } = req.body
    if (!username || !password || !firstName || !lastName || !gender || age === undefined || age === null || !location) {
        return res.status(400).json({ error: 'Missing required fields' })
    }
    User.findOne({ username: username }, (err, user) => {
        if (err) {
            console.log('User.js post error: ', err)
        } else if (user) {
            res.json({
                error: `Sorry, already a user with the username: ${username}`
            })
        }
        else {
            const newUser = new User({
                username: username,
                password: password,
                firstName: firstName,
                lastName: lastName,
                gender: gender,
                age: age,
                location: location
            })
            User.create(newUser, (err, savedUser) => {
                if (err) return res.json(err)
                res.json(savedUser)
            })
        }
    })
})

router.post(
    '/login',
    function (req, res, next) {
        console.log('routes/user.js, login, req.body: ');
        console.log(req.body)
        next()
    },
    passport.authenticate('local'),
    (req, res) => {
        console.log('logged in', req.user);
        var userInfo = {
            username: req.user.username
        };
        console.log(req.user.username + " is logged in")
        res.send(userInfo);
    }
)

router.get('/', (req, res, next) => {
    console.log('===== user!!======')
    console.log(req.user)
    if (req.user) {
        res.json({ user: serializeUser(req.user) })
    } else {
        res.json({ user: null })
    }
})

router.post('/logout', (req, res) => {
    if (req.user) {
        req.logout()
        res.send({ msg: 'logging out' })
    } else {
        res.send({ msg: 'no user to log out' })
    }
})

router.put('/clubs', requireAuth, async (req, res) => {
	const { clubRegionIds } = req.body
	if (!Array.isArray(clubRegionIds)) {
		return res.status(400).json({ error: 'clubRegionIds must be an array' })
	}

	const sanitized = [...new Set(clubRegionIds)]
		.filter((value) => typeof value === 'string')
		.map((value) => value.trim())
		.filter(Boolean)

	try {
		const updatedUser = await User.findByIdAndUpdate(
			req.user._id,
			{ clubRegionIds: sanitized },
			{ new: true, select: '_id username firstName lastName location clubRegionIds' }
		)
		return res.json({ user: serializeUser(updatedUser) })
	} catch (error) {
		return res.status(500).json({ error: 'Unable to save club preferences' })
	}
})

module.exports = router
