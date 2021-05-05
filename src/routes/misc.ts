import { Request, Response, Router } from 'express';
import { getConnection } from 'typeorm';
import Comment from '../entities/Comment';
import Post from '../entities/Post';
import Sub from '../entities/Sub';
import User from '../entities/User';
import Vote from '../entities/Vote';

import auth from '../middleware/auth';
import user from '../middleware/user';

// VOTING
const vote = async (req: Request, res: Response) => {
	const { identifier, slug, commentIdentifier, value } = req.body;

	// Validate vote values  -1, 0, -1
	if (![-1, 0, 1].includes(value)) {
		return res.status(400).json({ value: 'Value must be -1, 0, or 1' });
	}

	try {
		const user: User = res.locals.user;
		let post = await Post.findOneOrFail({ identifier, slug });
		let vote: Vote | undefined;
		let comment: Comment | undefined;

		if (commentIdentifier) {
			// if commentIdentifier exists find vote by comment cuz thats a vote on a comment.
			comment = await Comment.findOneOrFail({ identifier: commentIdentifier });
			vote = await Vote.findOne({ user, comment });
		} else {
			//--> else find vote by post cuz thats a vote on a comment
			vote = await Vote.findOne({ user, post });
		}

		if (!vote && value === 0) {
			// if no vote and value is 0 -> return error
			return res.status(404).json({ error: 'Vote not found' });
		} else if (!vote) {
			// if no vote but the value(1 or -1) is passed -> create vote
			vote = new Vote({ user, value });
			if (comment) vote.comment = comment;
			else vote.post = post;
			await vote.save();
		} else if (value === 0) {
			// if vote exists but value passed is 0 -> remove vote from DB
			await vote.remove();
		} else if (vote.value !== value) {
			// if vote is passed and its value has changed -> update vote
			vote.value = value;
			await vote.save();
		}

		post = await Post.findOneOrFail(
			{ identifier, slug },
			{ relations: ['comments', 'comments.votes', 'votes', 'sub'] },
		);

		post.setUserVote(user);
		post.comments.forEach((c) => c.setUserVote(user));

		return res.json(post);
	} catch (err) {
		return res.status(500).json({ error: 'Something went wrong' });
	}
};

// GETTING TOP SUBS
const topSubs = async (_: Request, res: Response) => {
	try {
		const imageUrlExp = `COALESCE('${process.env.APP_URL}/images/' || s."imageUrn" , 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y')`;
		const subs = await getConnection()
			.createQueryBuilder()
			.select(
				`s.title, s.name, ${imageUrlExp} as "imageUrl", count(p.id) as "postCount"`,
			)
			.from(Sub, 's')
			.leftJoin(Post, 'p', `s.name = p."subName"`)
			.groupBy('s.title, s.name, "imageUrl"')
			.orderBy(`"postCount"`, 'DESC')
			.limit(5)
			.execute();

		return res.json(subs);
	} catch (err) {
		return res.status(500).json({ error: 'Something went wrong' });
	}
};

const router = Router();
router.get('/top-subs', topSubs);
router.post('/vote', user, auth, vote);
export default router;
