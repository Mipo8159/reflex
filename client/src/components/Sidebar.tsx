import { Sub } from '../types';
import Link from 'next/link';
import dayjs from 'dayjs';
import { useAuthState } from '../context/auth';

const Sidebar = ({ sub }: { sub: Sub }) => {
	const { authenticated } = useAuthState();

	return (
		<div className='ml-6 w-80'>
			<div className='bg-white rounded'>
				<div className='p-3 bg-orange-800 rounded-t'>
					<p className='font-semibold text-white'>About Community</p>
				</div>

				<div className='p-3'>
					<p className='mb-3 text-md'>{sub.description}</p>
					<div className='flex mb-3 text-sm font-medium'>
						Group created by
						<Link href={`/u/${sub.username}`}>
							<a className='ml-1 font-bold text-orange-800'>{sub.username}</a>
						</Link>
					</div>
				</div>

				<div className='p-3'>
					<p className='mb-3 '>
						<i className='mr-2 fas fa-birthday-cake'></i>
						Created on: {dayjs(sub.createdAt).format('D MMM YYYY')}
					</p>
					{authenticated && (
						<Link href={`/r/${sub.name}/submit`}>
							<a className='w-full py-1 text-sm orange button'>Create post</a>
						</Link>
					)}
				</div>
			</div>
		</div>
	);
};

export default Sidebar;
