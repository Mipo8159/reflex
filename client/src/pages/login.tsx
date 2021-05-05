import Axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import InputGroup from '../components/InputGroup';
import { useAuthDispatch } from '../context/auth';
import { GetServerSideProps } from 'next';

export default function Login() {
	const initialState = { username: '', password: '' };
	const [userData, setUserData] = useState(initialState);
	const { username, password } = userData;
	const [errors, setErrors] = useState<any>({});

	const dispatch = useAuthDispatch();
	// const { authenticated } = useAuthState();
	const router = useRouter();
	// if (authenticated) router.push('/');

	const handleData = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setUserData({ ...userData, [name]: value });
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		try {
			const res = await Axios.post('/auth/login', { ...userData });

			dispatch('LOGIN', res.data);
			router.back();
		} catch (err) {
			setErrors(err.response.data);
		}
	};

	return (
		<div className='flex'>
			<Head>
				<title>Login</title>
			</Head>
			<div
				className='w-40 h-screen bg-center bg-cover'
				style={{ backgroundImage: 'url(/images/pattern.jpg)' }}
			/>

			<div className='flex flex-col justify-center pl-6'>
				<div className='w-70'>
					<h1 className='mb-2 text-lg font-medium'>Log in</h1>
					<p className='mb-10 text-xs'>
						By continuing, you agree to behave well on the forum
					</p>

					<form onSubmit={handleSubmit}>
						{/* Username */}
						<InputGroup
							className='mb-2'
							type='text'
							placeholder='Username'
							name='username'
							value={username}
							onChange={handleData}
							error={errors.username}
						/>

						{/* Password */}
						<InputGroup
							className='mb-4'
							type='password'
							placeholder='Password'
							name='password'
							value={password}
							onChange={handleData}
							error={errors.password}
						/>

						{/* Button */}
						<button className='w-full py-2 mb-4 text-xs font-bold text-white uppercase bg-orange-800 border-orange-800 rounded'>
							Log in
						</button>
					</form>
					<small>
						New to Reflex?
						<Link href='/register'>
							<a className='ml-1 text-orange-900'>Sign up</a>
						</Link>
					</small>
				</div>
			</div>
		</div>
	);
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	try {
		const cookie = req.headers.cookie;
		if (!cookie) return { props: {} };

		const res = await Axios.get('/auth/accessToken', { headers: { cookie } });

		if (res.data.username && res.data.email)
			throw new Error('Missing auth token cookie');

		return { props: {} };
	} catch (err) {
		res.writeHead(307, { Location: '/' }).end();
	}
};
