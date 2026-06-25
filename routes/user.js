const express = require('express')
const router = express.Router()
const User = require('../models/user')
const passport = require('../passport')

const sanitizeUser = (user) => {
    if (!user) {
        return null
    }

    const userObject = typeof user.toObject === 'function' ? user.toObject() : { ...user }
    delete userObject.password
    return userObject
}

const requireAuth = (req, res, next) => {
	if (req.user) {
		return next()
	}
	return res.status(401).json({ error: 'Unauthorized' })
}

router.post('/', (req, res) => {
    const { username, password, firstName, lastName, gender, age, location } = req.body
    if (!username || !password || !firstName || !lastName || !gender || age === undefined || age === null || !location) {
        return res.status(400).json({ error: 'Missing required fields' })
    }
    User.findOne({ username: username }, (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to create user' })
        } else if (user) {
            return res.json({
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
                if (err) {
                    return res.status(500).json({ error: 'Unable to create user' })
                }
                return res.json(sanitizeUser(savedUser))
            })
        }
    })
})

router.post(
    '/login',
    passport.authenticate('local'),
    (req, res) => {
        var userInfo = {
            username: req.user.username
        };
        res.send(userInfo);
    }
)

router.get('/', (req, res, next) => {
    if (req.user) {
        res.json({ user: sanitizeUser(req.user) })
    } else {
        res.json({ user: null })
    }
})

router.post('/logout', (req, res, next) => {
    if (!req.user) {
        return res.send({ msg: 'no user to log out' })
    }

    const done = (err) => {
        if (err) {
            return next(err)
        }
        return res.send({ msg: 'logging out' })
    }

    if (req.logout.length === 0) {
        req.logout()
        return done()
    }

    return req.logout(done)
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
			{ new: true, select: 'username clubRegionIds' }
		)
		return res.json({ user: updatedUser })
	} catch (error) {
		return res.status(500).json({ error: 'Unable to save club preferences' })
	}
})

module.exports = router
