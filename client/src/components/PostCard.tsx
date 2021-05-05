import Link from 'next/link';
import { Post } from '../types';
import Axios from 'axios';
import classNames from 'classnames';
import { useAuthState } from '../context/auth';
import ActionButton from './ActionButton';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useRouter } from 'next/router';
import submit from '../pages/r/[sub]/submit';
dayjs.extend(relativeTime);

interface PostCardProps {
  post: Post;
  revalidate?: Function;
}

export default function PostCard({ post, revalidate }: PostCardProps) {
  const { authenticated } = useAuthState();
  const router = useRouter();
  const isInSubPage = router.pathname === '/r/[sub]';

  const vote = async (value: number) => {
    // if not logged in go to login
    if (!authenticated) router.push('/login');

    // if vote is the same set value to 0
    if (value === post.userVote) value = 0;

    try {
      const res = await Axios.post('/misc/vote', {
        identifier: post.identifier,
        slug: post.slug,
        value,
      });

      if (revalidate) revalidate();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      key={post.identifier}
      className='flex mb-4 bg-white rounded'
      id={post.identifier}
    >
      {/* Voting section*/}
      <div className='w-10 py-3 text-center bg-gray-200 rounded-l'>
        {/* Upvote */}
        <div
          className='w-6 p-1 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-orange-800'
          onClick={() => vote(1)}
        >
          <i
            className={classNames('icon-arrow-up', {
              'text-orange-800': post.userVote === 1,
            })}
          ></i>
        </div>

        <p className='text-xs font-bold'>{post.voteScore}</p>
        {/* Downvote */}
        <div
          className='w-6 p-1 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-blue-500'
          onClick={() => vote(-1)}
        >
          <i
            className={classNames('icon-arrow-down', {
              'text-blue-500': post.userVote === -1,
            })}
          ></i>
        </div>
      </div>

      {/* Posting section */}
      <div className='w-full p-2'>
        <div className='flex items-center'>
          {!isInSubPage && (
            <>
              <Link href={`/r/${post.subName}`}>
                <a>
                  <img
                    src={post.sub.imageUrl}
                    alt='gravatar placeholder'
                    className='w-6 h-6 mr-1 rounded-full'
                  />
                </a>
              </Link>
              <Link href={`/r/${post.subName}`}>
                <a className='text-xs font-bold hover:underline'>
                  /r/{post.subName}
                </a>
              </Link>
              <span className='mx-1 text-gray-500'>•</span>
            </>
          )}

          <p className='text-xs text-gray-600'>
            Posted by
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

        <Link href={post.url}>
          <a className='my-1 text-lg font-medium'>{post.title}</a>
        </Link>
        {post.body && <p className='my-1 text-sm'>{post.body}</p>}

        <div className='flex'>
          <Link href={post.url}>
            <a>
              <ActionButton>
                <i className='mr-1 fas fa-comment-alt fa-xs'></i>
                <span className='font-bold'>{post.commentCount} Comments</span>
              </ActionButton>
            </a>
          </Link>

          <ActionButton>
            <i className='mr-1 fas fa-share fa-xs'></i>
            <span className='font-bold'>Share</span>
          </ActionButton>

          <ActionButton>
            <i className='mr-1 fas fa-bookmark fa-xs'></i>
            <span className='font-bold'>Save</span>
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
