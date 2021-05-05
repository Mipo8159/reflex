import { useRouter } from 'next/router';
import useSWR from 'swr';
import Link from 'next/link';
import Head from 'next/head';
import { FormEvent, useState } from 'react';
import Axios from 'axios';
import Sidebar from '../../../components/Sidebar';
import { Post, Sub } from '../../../types';
import { GetServerSideProps } from 'next';

const submit = () => {
	const [title, setTitle] = useState('');
	const [body, setBody] = useState('');

	const router = useRouter();
	const { sub: subName } = router.query;

	const { data: sub, error } = useSWR<Sub>(subName ? `/subs/${subName}` : null);
	if (error) router.push('/');

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		if (title.trim() === '') return;

		try {
			const { data: post } = await Axios.post<Post>('/posts', {
				title: title.trim(),
				body,
				sub: subName,
			});

			router.push(`/r/${sub.name}/${post.identifier}/${post.slug}`);
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<div className='container flex pt-5'>
			<Head>
				<title>Submit post</title>
			</Head>
			<div className='w-160'>
				<div className='p-4 bg-white rounded'>
					<h1 className='mb-3 text-lg'>
						Submit a post to{' '}
						<span className='font-medium text-orange-700'>
							<Link href={`/r/{subName}`}>
								<a>/r/{subName}</a>
							</Link>
						</span>
					</h1>

					{/* Post Form */}
					<form onSubmit={handleSubmit}>
						{/* Submit title */}
						<div className='relative mb-2'>
							<input
								type='text'
								className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-orange-300'
								placeholder='Title'
								maxLength={300}
								value={title}
								onChange={(e) => setTitle(e.target.value)}
							/>
							<div
								className='absolute mb-2 text-sm text-gray-500 select-none'
								style={{ top: 11, right: 10 }}>
								{title.trim().length}/300
							</div>
						</div>

						{/* Submit body */}
						<textarea
							className='w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-orange-300'
							value={body}
							onChange={(e) => setBody(e.target.value)}
							placeholder='Text (Optional)'
							rows={4}
						/>

						{/* Submit button */}
						<div className='flex justify-end'>
							<button
								className='px-5 py-1 orange button'
								type='submit'
								disabled={title.trim().length === 0}>
								Submit
							</button>
						</div>
					</form>
				</div>
			</div>

			{sub && <Sidebar sub={sub} />}
		</div>
	);
};

export default submit;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	try {
		const cookie = req.headers.cookie;
		if (!cookie) throw new Error('Missing auth token cookie');

		await Axios.get('/auth/accessToken', { headers: { cookie } });
		return { props: {} };
	} catch (err) {
		res.writeHead(307, { Location: '/login' }).end();
	}
};
