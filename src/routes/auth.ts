import { Request, Response, Router } from 'express';
import User from '../entities/User';
import { isEmpty, validate } from 'class-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

import auth from '../middleware/auth';
import user from '../middleware/user';

const mapErrors = (errors: Object[]) => {
	return errors.reduce((prev: any, err: any) => {
		prev[err.property] = Object.entries(err.constraints)[0][1];
		return prev;
	}, {});
};

/* REGISTER */
const register = async (req: Request, res: Response) => {
	const { username, email, password } = req.body;

	try {
		//--> validate
		let errors: any = {};
		const EmailUser = await User.findOne({ email });
		const UsernameUser = await User.findOne({ username });
		if (EmailUser) errors.email = 'This email is already taken';
		if (UsernameUser) errors.username = 'This username is already taken';

		if (Object.keys(errors).length > 0) return res.status(400).json(errors);

		//--> create
		const user = new User({ username, email, password });

		errors = await validate(user);

		if (errors.length > 0) {
			return res.status(400).json(mapErrors(errors));
		}

		await user.save();

		//-->return
		return res.json(user);
	} catch (err) {
		return res.status(500).json({ error: 'Something went wrong' });
	}
};

/* LOGIN */
const login = async (req: Request, res: Response) => {
	const { username, password } = req.body;

	try {
		//--> Validation 1-st phase
		let errors: any = {};
		if (isEmpty(username)) errors.username = 'Username must not be empty';
		if (isEmpty(password)) errors.password = 'Password must not be empty';
		if (Object.keys(errors).length > 0) {
			return res.status(400).json(errors);
		}

		//--> Validation 2-nd phase
		const user = await User.findOne({ username });
		if (!user) return res.status(404).json({ username: 'User not found' });

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch)
			return res.status(400).json({ password: 'Password is incorrect' });

		//--> Generate token
		const token = jwt.sign({ username }, process.env.JWT_SECRET!);

		//--> Setting cookie
		res.set(
			'Set-Cookie',
			cookie.serialize('token', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: 3600,
				path: '/',
			}),
		);
		return res.json(user);
	} catch (err) {
		return res.status(500).json({ error: 'Something went wrong' });
	}
};

/* ACCESS TOKEN */
const accessToken = (_: Request, res: Response) => {
	const user = res.locals.user;
	return res.json(user);
};

/* LOG OUT */
const logout = (_: Request, res: Response) => {
	res.set(
		'Set-Cookie',
		cookie.serialize('token', '', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			expires: new Date(0),
			path: '/',
		}),
	);

	return res.status(200).json({ success: true });
};

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.get('/accessToken', user, auth, accessToken);
router.get('/logout', user, auth, logout);
export default router;
