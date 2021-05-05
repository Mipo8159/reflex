import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Link from 'next/link';
import Image from 'next/image';
import { Post, Comment } from '../../../../types';
import Sidebar from '../../../../components/Sidebar';
import Axios from 'axios';
import classNames from 'classnames';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useAuthState } from '../../../../context/auth';
import ActionButton from '../../../../components/ActionButton';
import { FormEvent, useState, useEffect } from 'react';

dayjs.extend(relativeTime);

export default function PostPage() {
  const [newComment, setNewComment] = useState('');
  const [description, setDescription] = useState('');

  const router = useRouter();
  const { identifier, sub, slug } = router.query;
  const { authenticated, user } = useAuthState();

  //--> fetching data SWR
  const { data: post, error } = useSWR<Post>(
    identifier && slug ? `/posts/${identifier}/${slug}` : null
  );

  const { data: comments, revalidate } = useSWR<Comment[]>(
    identifier && slug ? `/posts/${identifier}/${slug}/comments` : null
  );
  if (error) router.push('/');

  useEffect(() => {
    if (!post) return;

    let desc = post.body || post.title;
    desc = desc.substring(0, 158).concat('..'); //hello world . .

    setDescription(desc);
  }, [post]);

  const vote = async (value: number, comment?: Comment) => {
    if (!authenticated) router.push('/login');

    //--> if vote is the same reset it
    if (
      (!comment && value === post.userVote) ||
      (comment && comment.userVote === value)
    )
      value = 0;

    try {
      await Axios.post('/misc/vote', {
        identifier,
        slug,
        commentIdentifier: comment?.identifier,
        value,
      });

      revalidate();
    } catch (err) {
      console.log(err);
    }
  };

  const submitComment = async (event: FormEvent) => {
    event.preventDefault();

    if (newComment.trim() === '') return;

    try {
      await Axios.post(`/posts/${post.identifier}/${post.slug}/comments`, {
        body: newComment,
      });

      setNewComment('');
      revalidate();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Head>
        <title>{post?.title}</title>
        <meta name='description' content={description} />
        <meta property='og:description' content={description} />
        <meta property='og:title' content={post?.title} />
        <meta property='twitter:description' content={description} />
        <meta property='twitter:title' content={post?.title} />
      </Head>

      <Link href={`/r/${sub}`}>
        <a className='flex items-center w-full h-20 p-8 bg-blue-500'>
          <div className='container flex'>
            {post && (
              <div className='w-8 h-8 mr-2 overflow-hidden rounded-full'>
                <Image
                  src={post.sub.imageUrl}
                  height={(8 * 16) / 4}
                  width={(8 * 16) / 4}
                />
              </div>
            )}
            <p className='text-xl font-semibold text-white'>/r/{sub}</p>
          </div>
        </a>
      </Link>

      <div className='container flex pt-5'>
        {/*POST*/}
        <div className='w-160'>
          <div className='bg-white rounded'>
            {post && (
              <>
                <div className='flex'>
                  {/* VOTE SECTION*/}

                  <div className='flex-shrink-0 w-10 py-2 text-center rounded-l'>
                    {/* upvote */}
                    <div
                      className='w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500'
                      onClick={() => vote(1)}
                    >
                      <i
                        className={classNames('icon-arrow-up', {
                          'text-red-500': post.userVote === 1,
                        })}
                      ></i>
                    </div>
                    <p className='text-xs font-bold'>{post.voteScore}</p>
                    {/* downvote */}
                    <div
                      className='w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-blue-600'
                      onClick={() => vote(-1)}
                    >
                      <i
                        className={classNames('icon-arrow-down', {
                          'text-blue-600': post.userVote === -1,
                        })}
                      ></i>
                    </div>
                  </div>

                  <div className='py-2 pr-2'>
                    <div className='flex items-center'>
                      <p className='text-xs text-gray-500'>
                        Post by
                        <Link href={`/u/${post.username}`}>
                          <a className='mx-1 hover:underline'>/u/{post.username}</a>
                        </Link>
                        <Link href={post.url}>
                          <a className='mx-1 hover:underline'>
                            {dayjs(post.createdAt).fromNow()}
                          </a>
                        </Link>
                      </p>
                    </div>

                    <h1 className='my-1 text-xl font-medium'>{post.title}</h1>
                    {/*POST BODY*/}
                    <p className='my-3 text-sm'>{post.body}</p>

                    {/*ACTION BUTTONS*/}
                    <div className='flex'>
                      {/* comments */}
                      <Link href={post.url}>
                        <a>
                          <ActionButton>
                            <i className='mr-1 fas fa-comment-alt fa-xs'></i>
                            <span className='font-bold'>
                              {post.commentCount} Comments
                            </span>
                          </ActionButton>
                        </a>
                      </Link>

                      {/* share */}
                      <ActionButton>
                        <i className='mr-1 fas fa-bookmark fa-xs'></i>
                        <span className='font-bold'>Share</span>
                      </ActionButton>

                      {/* save */}
                      <ActionButton>
                        <i className='mr-1 fas fa-share fa-xs'></i>
                        <span className='font-bold'>Save</span>
                      </ActionButton>
                    </div>
                  </div>
                </div>

                {/* COMMENT INPUT */}
                <div className='pl-10 pr-6 mb-4'>
                  {authenticated ? (
                    <div>
                      <p className='mb-1 text-xs'>
                        Comment as
                        <Link href={`/u/${user.username}`}>
                          <a className='ml-1 font-semibold text-blue-500'>
                            {user.username}
                          </a>
                        </Link>
                      </p>

                      <form onSubmit={submitComment}>
                        <textarea
                          className='w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-gray-600'
                          onChange={(e) => setNewComment(e.target.value)}
                          value={newComment}
                        ></textarea>

                        <div className='flex justify-end'>
                          <button
                            className='px-3 py-1 blue button'
                            disabled={newComment.trim() === ''}
                          >
                            Comment
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className='flex items-center justify-between px-2 py-4 border border-gray-200 rounded'>
                      <p className='font-semibold text-gray-400'>
                        Log in or sign up to leave a comment
                      </p>
                      <div>
                        <Link href='/login'>
                          <a className='px-4 py-1 mr-4 hollow-blue button'>Login</a>
                        </Link>

                        <Link href='/register'>
                          <a className='px-4 py-1 blue button'>Sign up</a>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* COMMENTS*/}
                <hr />
                {comments?.map((comment) => (
                  <div className='flex' key={comment.identifier}>
                    <div className='flex-shrink-0 w-10 py-2 text-center rounded-l'>
                      {/* upvote */}
                      <div
                        className='w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500'
                        onClick={() => vote(1, comment)}
                      >
                        <i
                          className={classNames('icon-arrow-up', {
                            'text-red-500': comment.userVote === 1,
                          })}
                        ></i>
                      </div>

                      <p className='text-xs font-bold'>{comment.voteScore}</p>

                      {/* downvote */}
                      <div
                        className='w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-blue-600'
                        onClick={() => vote(-1, comment)}
                      >
                        <i
                          className={classNames('icon-arrow-down', {
                            'text-blue-600': comment.userVote === -1,
                          })}
                        ></i>
                      </div>
                    </div>

                    <div className='py-2 pr-2'>
                      <p className='mb-1 text-xs leading-none'>
                        <Link href={`/u/${comment.username}`}>
                          <a className='mr-1 font-bold hover:underline'>
                            {comment.username}
                          </a>
                        </Link>

                        <span className='text-gray-600'>
                          {`
										${comment.voteScore}
										points •
										${dayjs(comment.createdAt).fromNow()}
										`}
                        </span>
                      </p>

                      <p>{comment.body}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
        {/*SIDEBAR*/}
        {post && <Sidebar sub={post.sub} />}
      </div>
    </>
  );
}
