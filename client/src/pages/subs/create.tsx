import { ChangeEvent, FormEvent, useState } from 'react';
import Head from 'next/head';
import Axios from 'axios';
import { GetServerSideProps } from 'next';
import classNames from 'classnames';
import { useRouter } from 'next/router';

const Create = () => {
	const initialState = { title: '', name: '', description: '' };
	const [userData, setUserData] = useState(initialState);
	const { name, title, description } = userData;

	const [errors, setErrors] = useState<Partial<any>>({});
	const router = useRouter();

	const handleChange = (
		e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setUserData({ ...userData, [name]: value });
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		try {
			const res = await Axios.post('/subs', { ...userData });
			router.push(`/r/${res.data.name}`);
		} catch (err) {
			setErrors(err.response.data);
		}
	};

	return (
		<div className='flex bg-white'>
			<Head>
				<title>Create a Community</title>
			</Head>

			<div
				className='w-40 h-screen bg-center bg-cover'
				style={{ backgroundImage: 'url(/images/pattern.jpg)' }}></div>

			<div className='flex flex-col justify-center pl-6'>
				<div className='w-98'>
					<h1 className='mb-2 text-lg font-medium'>Create a Community</h1>

					<hr />

					<form onSubmit={handleSubmit}>
						{/* Name */}
						<div className='my-6'>
							<p className='mb-1 font-medium'>Name</p>
							<p className='mb-2 text-xs text-gray-500'>
								Community names including capitalization can not be changed.
							</p>
							<input
								type='text'
								className={classNames(
									'w-full p-3 border border-gray-200 rounded hover:border-gray-500',
									{ 'border-orange-600': errors.name },
								)}
								name='name'
								value={name}
								onChange={handleChange}
							/>
							<small className='font-medium text-red-600'>{errors.name}</small>
						</div>

						{/* Title */}
						<div className='my-6'>
							<p className='mb-1 font-medium'>Title</p>
							<p className='mb-2 text-xs text-gray-500'>
								Community Title represents topic of the <sub></sub>.
							</p>
							<input
								type='text'
								className={classNames(
									'w-full p-3 border border-gray-200 rounded hover:border-gray-500',
									{ 'border-orange-600': errors.title },
								)}
								name='title'
								value={title}
								onChange={handleChange}
							/>
							<small className='font-medium text-red-600'>{errors.title}</small>
						</div>

						{/* Description */}
						<div className='my-6'>
							<p className='mb-1 font-medium'>Description</p>
							<p className='mb-2 text-xs text-gray-500'>
								The body part of your sub
							</p>
							<textarea
								className={classNames(
									'w-full p-3 border border-gray-200 rounded hover:border-gray-500',
									{ 'border-orange-600': errors.description },
								)}
								name='description'
								value={description}
								onChange={handleChange}
							/>
							<small className='font-medium text-red-600'>
								{errors.description}
							</small>
						</div>

						{/* Submit Button */}
						<div className='flex justify-end'>
							<button
								className='px-4 py-1 leading-5 orange button'
								type='submit'>
								Create Community
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Create;

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
