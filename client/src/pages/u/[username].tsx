import { useRouter } from 'next/router';
import useSWR from 'swr';
import Head from 'next/head';
import PostCard from '../../components/PostCard';
import Link from 'next/link';
import Image from 'next/image';
import { Post, Comment } from '../../types';
import dayjs from 'dayjs';

const UserPage = () => {
	const router = useRouter();
	const username = router.query.username;

	const { data, error } = useSWR<any>(username ? `/users/${username}` : null);
	if (error) router.push('/');

	console.log(data);
	return (
		<>
			<Head>
				<title>{data?.user.username}</title>
			</Head>
			{data && (
				<div className='container flex pt-5'>
					<div className='w-160'>
						{data.submissions.map((submission: any) => {
							if (submission.type === 'Post') {
								const post: Post = submission;
								return <PostCard key={post.identifier} post={post} />;
							} else {
								const comment: Comment = submission;
								return (
									<div
										key={comment.identifier}
										className='flex my-4 bg-white rounded'>
										<div className='flex-shrink-0 w-10 py-4 text-center bg-gray-200 rounded-l'>
											<i className='text-gray-500 fas fa-comment-alt fa-xs'></i>
										</div>

										<div className='w-full p-2'>
											<p className='mb-2 text-xs text-gray-500'>
												<span className='mr-1 text-orange-600'>
													{comment.username}
												</span>

												<span>commented on </span>
												<Link href={comment.post.url}>
													<a className='font-semibold hover:underline'>
														{comment.post.title}
													</a>
												</Link>
												<span className='mx-1 text-gray-500'>•</span>

												<Link href={`/r/${comment.post.subName}`}>
													<a className='font-semibold hover:underline'>
														/r/{comment.post.subName}
													</a>
												</Link>
											</p>

											<hr />

											<p>{comment.body}</p>
										</div>
									</div>
								);
							}
						})}
					</div>

					{/* Sidebar */}
					<div className='ml-6 w-80'>
						<div className='bg-white rounded'>
							<div className='flex items-center justify-center p-2 bg-orange-800 rounded-t'>
								<div className='w-16 h-16 border-2 border-white rounded-full'>
									<Image
										src='https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
										alt='profile image'
										height={64}
										width={64}
										className='border-2 border-white rounded-full'
									/>
								</div>
							</div>

							<div className='p-3 text-center'>
								<h1 className='mb-3 text-xl text-center'>
									{data.user.username}
								</h1>
								<hr />
								<p className='mt-3'>
									Joined {dayjs(data.user.createdAt).format('MMM YYY')}
								</p>
							</div>
						</div>
					</div>
				</div>
			)}
			;
		</>
	);
};
export default UserPage;
