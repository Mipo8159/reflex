import Head from 'next/head';
import { Post, Sub } from '../types';
import PostCard from '../components/PostCard';
import useSWR, { useSWRInfinite } from 'swr';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthState } from '../context/auth';
import { useState, useEffect } from 'react';
import Loader from '../components/Loader';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export default function Home() {
  const [observedPost, setObservedPost] = useState('');
  const { authenticated } = useAuthState();

  // const { data: posts } = useSWR<Post[]>('/posts');    //--> (BEFORE INFINITE)
  const { data: topSubs } = useSWR<Sub[]>('/misc/top-subs');

  //= = = = = = = = Meta = = = = = = = = =//
  const description =
    'Reflex is an experimental social network built by Mipo for Beflex.ge You are most welcome to join and bevome a reflexor.';
  const title = 'Reflex: The welcome page for reflexors';
  //= = = = = = = = Meta = = = = = = = = =//

  // const [posts, setPosts] = useState<Post[]>([]);

  // useEffect(() => {    //--> (BEFORE SWR)
  // 	Axios.get('/posts')
  // 		.then((res) => setPosts(res.data))
  // 		.catch((err) => console.log(err));
  // }, []);

  const {
    data,
    error,
    size: page,
    setSize: setPage,
    isValidating,
    revalidate,
  } = useSWRInfinite<Post[]>((index) => `/posts?page=${index}`);

  const posts: Post[] = data ? [].concat(...data) : [];
  const isLoadingInitialData = !data && !error;

  useEffect(() => {
    if (!posts || posts.length === 0) return;

    const id = posts[posts.length - 1].identifier;

    if (id !== observedPost) {
      setObservedPost(id);
      observedElement(document.getElementById(id));
    }
  }, [posts]);

  const observedElement = (element: HTMLElement) => {
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting === true) {
          setPage(page + 1);
          observer.unobserve(element);
        }
      },
      { threshold: 1 }
    );
    observer.observe(element);
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name='description' content={description} />
        <meta property='og:description' content={description} />
        <meta property='twitter:description' content={description} />
        <meta property='og:title' content={title} />
        <meta property='twitter:title' content={title} />
      </Head>

      <div className='container flex px-4 pt-4 md:px-0'>
        {/* Posts feed */}
        <div className='w-full md:w-160'>
          {isLoadingInitialData && <Loader />}
          {posts?.map((post) => (
            <PostCard key={post.identifier} post={post} revalidate={revalidate} />
          ))}
        </div>

        {/* Sidebar */}
        <div className='hidden ml-6 md:block w-80'>
          <div className='bg-white rounded'>
            <div className='p-4 border-b-2'>
              <p className='text-lg font-semibold text-center'>Top Communities</p>
            </div>

            <div>
              {topSubs?.map((sub) => (
                <div
                  key={sub.name}
                  className='flex items-center px-4 py-2 text-xs border-b'
                >
                  <Link href={`/r/${sub.name}`}>
                    <a>
                      <Image
                        src={sub.imageUrl}
                        alt='sub'
                        className='rounded-full'
                        width={(6 * 16) / 4}
                        height={(6 * 16) / 4}
                      />
                    </a>
                  </Link>

                  <Link href={`/r/${sub.name}`}>
                    <a className='ml-2 font-bold cursor-pointer'>/r/{sub.name}</a>
                  </Link>

                  <p className='ml-auto font-medium'>{sub.postCount}</p>
                </div>
              ))}
            </div>

            {authenticated && (
              <div className='p-4 border-t-2'>
                <Link href='/subs/create'>
                  <a className='w-full px-2 py-2 orange button'>Create Community</a>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// export const getServerSideProps: GetServerSideProps = async (ctx) => {
// 	try {
// 		const res = await Axios.get('/posts');

// 		return { props: { data: res.data } };
// 	} catch (err) {
// 		return { props: { error: 'Something went wrong' } };
// 	}
// };
