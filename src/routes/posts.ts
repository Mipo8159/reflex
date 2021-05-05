import { Request, Response, Router } from 'express';
import Comment from '../entities/Comment';
import Post from '../entities/Post';
import Sub from '../entities/Sub';

import auth from '../middleware/auth';
import user from '../middleware/user';

/* CREATE POST*/
const createPost = async (req: Request, res: Response) => {
  const { title, body, sub } = req.body;
  const user = res.locals.user;

  if (title.trim() === '') {
    return res.status(400).json({ title: 'Title must not be empty' });
  }

  try {
    //--> Find sub
    const subRecord = await Sub.findOneOrFail({ name: sub });

    const post = new Post({ title, body, user, sub: subRecord });
    await post.save();

    return res.json(post);
  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

/* FETCH ALL POSTS*/
const getPosts = async (req: Request, res: Response) => {
  const currentPage: number = (req.query.page || 0) as number;
  const postPerPage: number = (req.query.count || 8) as number;

  try {
    const posts = await Post.find({
      order: { createdAt: 'DESC' },
      relations: ['comments', 'sub', 'votes'],
      skip: currentPage * postPerPage,
      take: postPerPage,
    });

    if (res.locals.user) {
      posts.forEach((p) => p.setUserVote(res.locals.user));
    }

    return res.json(posts);
  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

/* FETCH SINGULAR POSTS*/
const getPost = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;
  try {
    const post = await Post.findOneOrFail(
      { identifier, slug },
      {
        relations: ['sub', 'votes', 'comments'],
      }
    );

    if (res.locals.user) {
      post.setUserVote(res.locals.user);
    }

    return res.json(post);
  } catch (err) {
    return res.status(404).json({ error: 'Post not found' });
  }
};

/* COMMENT ON POST */
const commentOnPost = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;
  const { body } = req.body;
  const user = res.locals.user;

  try {
    const post = await Post.findOneOrFail({ identifier, slug });

    const comment = new Comment({
      body,
      user,
      post,
    });

    await comment.save();

    return res.json(comment);
  } catch (err) {
    return res.status(404).json({ error: 'Post not found' });
  }
};

// FETCH COMMENT SEPERATELY
const getPostComments = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;
  try {
    const post = await Post.findOneOrFail({ identifier, slug });
    const comments = await Comment.find({
      where: { post },
      order: { createdAt: 'DESC' },
      relations: ['votes'],
    });

    if (res.locals.user) {
      comments.forEach((c) => c.setUserVote(res.locals.user));
    }

    return res.json(comments);
  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

const router = Router();
router.post('/', user, auth, createPost);
router.get('/', user, getPosts);
router.get('/:identifier/:slug/comments', user, getPostComments);
router.get('/:identifier/:slug', user, getPost);
router.post('/:identifier/:slug/comments', user, auth, commentOnPost);
export default router;
