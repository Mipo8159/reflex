import Link from 'next/link';
import Fish from '../images/fishy.svg';
import Image from 'next/image';
import Axios from 'axios';
import { useState, useEffect } from 'react';
import { useAuthState, useAuthDispatch } from '../context/auth';
import { Sub } from '../types';
import classNames from 'classnames';
import router from 'next/router';

const Navbar: React.FC = () => {
	const [name, setName] = useState('');
	const [subs, setSubs] = useState<Sub[]>([]);
	const [timer, setTimer] = useState(null);
	const [show, setShow] = useState(false);

	const { authenticated, loading } = useAuthState();
	const dispatch = useAuthDispatch();

	const logout = () => {
		Axios.get('/auth/logout')
			.then(() => {
				dispatch('LOGOUT');
				window.location.reload();
			})
			.catch((err) => console.log(err));
	};

	useEffect(() => {
		if (name.trim() === '') {
			setSubs([]);
			return;
		}
		searchSubs();
	}, [name]);

	const searchSubs = async () => {
		clearTimeout(timer);
		setTimer(
			setTimeout(async () => {
				try {
					const { data } = await Axios.get(`/subs/search/${name}`);
					setSubs(data);
				} catch (err) {
					console.log(err);
				}
			}, 200),
		);
	};

	const goToSub = (subName: string) => {
		router.push(`/r/${subName}`);
		setName('');
	};

	return (
		<nav className='fixed inset-x-0 top-0 z-10 flex items-center justify-between h-12 px-5 bg-white'>
			{/* Logo */}
			<div className='flex items-center'>
				<Link href='/'>
					<a>
						<Fish className='w-8 h-8 mr-2' />
					</a>
				</Link>
				<span className='hidden text-2xl font-semibold lg:block'>
					<Link href='/'>
						<a>Reflex</a>
					</Link>
				</span>
			</div>

			{/* Search */}
			<div className='max-w-full px-4 w-160'>
				<div className='relative flex items-center bg-gray-100 border rounded hover:border-orange-300 hover:bg-white'>
					<i className='pl-4 pr-3 text-gray-500 fas fa-search'></i>
					<input
						type='text'
						placeholder='Search'
						className='py-1 pr-3 bg-transparent rounded focus:outline-none'
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>

					<div
						className='absolute left-0 right-0 bg-white'
						style={{ top: '100%' }}>
						{subs?.map((sub) => (
							<div
								className='flex items-center px-4 py-3 cursor-pointer hover:bg-gray-200'
								onClick={() => goToSub(sub.name)}>
								<Image
									src={sub.imageUrl}
									alt='sub'
									height={(8 * 16) / 4}
									width={(8 * 16) / 4}
									objectFit='cover'
									className='rounded-full'
								/>

								<div className='ml-4 text-sm'>
									<p className='font-medium'>{sub.name} </p>
									<p className='text-gray-600'>{sub.title}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Buttons */}
			<div className='flex'>
				{!loading &&
					(authenticated ? (
						<button
							onClick={logout}
							className='w-20 py-1 mr-4 leading-5 lg:w-32 orange button'>
							Log out
						</button>
					) : (
						<>
							<div
								className={classNames(
									'sm:flex',
									{ hidden: !show },
									{
										'block absolute right-4 bg-white px-5 py-2 border border-gray-300 rounded top-12': show,
									},
								)}>
								<Link href='/login'>
									<a className='w-20 py-1 mr-4 leading-5 lg:w-32 hollow orange button'>
										Log in
									</a>
								</Link>
								<Link href='/login'>
									<a className='w-20 py-1 leading-5 lg:w-32 orange button'>
										Sign up
									</a>
								</Link>
							</div>

							<button
								className='flex items-center justify-center w-10 h-8 pl-1 text-gray-500 cursor-pointer sm:hidden button hover:bg-gray-200'
								onClick={() => (!show ? setShow(true) : setShow(false))}>
								<i className='mr-1 text-sm fa fa-user'></i>
							</button>
						</>
					))}
			</div>
		</nav>
	);
};

export default Navbar;
