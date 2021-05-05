import { NextFunction, Request, Response, Router } from 'express';
import { getRepository } from 'typeorm';
import { isEmpty } from 'class-validator';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';

import auth from '../middleware/auth';
import Sub from '../entities/Sub';
import User from '../entities/User';
import Post from '../entities/Post';
import user from '../middleware/user';
import { makeid } from '../utils/helper';

// CREATE SUB
const createSub = async (req: Request, res: Response) => {
	const { name, title, description } = req.body;
	const user: User = res.locals.user;

	//--> 1-st trycatch
	try {
		let errors: any = {};
		if (isEmpty(name)) errors.name = 'Name must not be empty';
		if (isEmpty(title)) errors.title = 'Title must not be empty';

		const sub = await getRepository(Sub)
			.createQueryBuilder('sub')
			.where('lower(sub.name) = :name', { name: name.toLowerCase() })
			.getOne();

		if (sub) errors.name = 'Sub already exists';

		if (Object.keys(errors).length > 0) {
			throw errors;
		}
	} catch (err) {
		return res.status(400).json(err);
	}

	//--> 2-nd trycatch
	try {
		const sub = new Sub({ name, description, title, user });
		await sub.save();

		return res.json(sub);
	} catch (err) {
		return res.status(500).json({ error: 'Something went wrong' });
	}
};

// GET SUB
const getSub = async (req: Request, res: Response) => {
	const name = req.params.name;

	try {
		const sub = await Sub.findOneOrFail({ name });
		const posts = await Post.find({
			where: { sub },
			order: { createdAt: 'DESC' },
			relations: ['comments', 'votes'],
		});

		sub.posts = posts;

		if (res.locals.user) {
			sub.posts.forEach((p) => p.setUserVote(res.locals.user));
		}

		return res.json(sub);
	} catch (err) {
		console.log(err);
		return res.status(404).json({ sub: 'Sub not found' });
	}
};

//CHECK IF SUB IS OURS
const ownSub = async (req: Request, res: Response, next: NextFunction) => {
	const user = res.locals.user;

	try {
		const sub = await Sub.findOneOrFail({ where: { name: req.params.name } });

		if (sub.username !== user.username) {
			return res.status(403).json({ error: 'You do not own this sub' });
		}

		res.locals.sub = sub;
		return next();
	} catch (err) {
		return res.status(500).json({ error: 'Something went wrong' });
	}
};

// MUTLER CODE
const upload = multer({
	storage: multer.diskStorage({
		destination: 'public/images',
		filename: (_, file, callback) => {
			const name = makeid(15);
			callback(null, name + path.extname(file.originalname)); // f.e aglaeuglaeg + .png
		},
	}),

	fileFilter: (_, file: Express.Multer.File, callback: FileFilterCallback) => {
		if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
			callback(null, true);
		} else {
			callback(new Error('File is not an image'));
		}
	},
});

//UPLOAD
const uploadSubImage = async (req: Request, res: Response) => {
	const sub: Sub = res.locals.sub;

	try {
		const type = req.body.type;

		//--> checking for invalid type
		if (type !== 'image' && type !== 'banner') {
			fs.unlinkSync(req.file.path);
			return res.status(400).json({ error: 'Invadlid type' });
		}

		//--> setting banner || image
		let oldImageUrn: string = '';
		if (type === 'image') {
			oldImageUrn = sub.imageUrn ?? '';
			sub.imageUrn = req.file.filename;
		} else if (type === 'banner') {
			oldImageUrn = sub.bannerUrn ?? '';
			sub.bannerUrn = req.file.filename;
		}

		await sub.save();

		if (oldImageUrn !== '') {
			fs.unlinkSync(`public\\images\\${oldImageUrn}`);
		}

		return res.json(sub);
	} catch (err) {
		return res.status(500).json({ error: 'Something went wrong' });
	}
};

// SEARCH SUBS
const searchSubs = async (req: Request, res: Response) => {
	try {
		const name = req.params.name;

		if (isEmpty(name)) {
			return res.status(400).json({ error: 'Name mst not be empty' });
		}

		//react => rea..
		const subs = await getRepository(Sub)
			.createQueryBuilder()
			.where('LOWER(name) LIKE :name', {
				name: `${name.toLowerCase().trim()}%`,
			})
			.getMany();

		return res.json(subs);
	} catch (err) {
		return res.status(500).json({ error: 'Something went wrong' });
	}
};

const router = Router();
router.get('/:name', user, getSub);
router.get('/search/:name', searchSubs);
router.post('/', user, auth, createSub);
router.post(
	'/:name/image',
	user,
	auth,
	ownSub,
	upload.single('file'),
	uploadSubImage,
);
export default router;
