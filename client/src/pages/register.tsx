import Axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import InputGroup from '../components/InputGroup';
import { GetServerSideProps } from 'next';

export default function Register() {
  const initialState = { username: '', email: '', password: '' };
  const [userData, setUserData] = useState(initialState);
  const { username, email, password } = userData;

  const [agreement, setAgreement] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const router = useRouter();

  const handleData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!agreement) {
      setErrors({ ...errors, agreement: 'You must agree to T&C' });
      return;
    }

    try {
      await Axios.post('/auth/register', { ...userData });

      router.push('/login');
    } catch (err) {
      setErrors(err.response.data);
    }
  };

  return (
    <div className='flex'>
      <Head>
        <title>Register</title>
      </Head>
      <div
        className='w-40 h-screen bg-center bg-cover'
        style={{
          backgroundImage: `url(${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/images/pattern.jpg)`,
        }}
      />

      <div className='flex flex-col justify-center pl-6'>
        <div className='w-70'>
          <h1 className='mb-2 text-lg font-medium'>Sign up</h1>
          <p className='mb-10 text-xs'>
            By continuing, you agree to behave well on the forum
          </p>

          <form onSubmit={handleSubmit}>
            {/* Checkbox */}
            <div className='mb-3'>
              <input
                type='checkbox'
                className='mr-1 cursor-pointer'
                id='agreement'
                checked={agreement}
                onChange={(e) => setAgreement(e.target.checked)}
              />
              <label htmlFor='agreement' className='text-xs cursor-pointer'>
                I agree to become a Reflexor
              </label>
              <small className='block font-medium text-red-600'>
                {errors.agreement}
              </small>
            </div>

            {/* Email */}
            <InputGroup
              className='mb-2'
              type='email'
              placeholder='Email'
              name='email'
              value={email}
              onChange={handleData}
              error={errors.email}
            />

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
              Sign up
            </button>
          </form>
          <small>
            Already a Reflexor?
            <Link href='/login'>
              <a className='ml-1 text-orange-900'>Log In</a>
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
