import 'reflect-metadata';
import { createConnection } from 'typeorm';
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

import trim from './middleware/trim';

import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import subRoutes from './routes/subs';
import miscRoutes from './routes/misc';
import UserRoutes from './routes/users';

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.ORIGIN,
    optionsSuccessStatus: 200,
  })
);
app.use(trim);
app.use(express.static('public'));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/subs', subRoutes);
app.use('/api/misc', miscRoutes);
app.use('/api/users', UserRoutes);

app.get('/', (_, res) => {
  res.send('Working fine Senior');
});

app.listen(process.env.PORT, async () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
  try {
    await createConnection();
    console.log('Database connected!');
  } catch (err) {
    console.log(err);
  }
});
