import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import userRoutes from './routes/userRoutes';
//import path from 'path';

//init prisma
const prisma = new PrismaClient();

//init express
const app = express();
const PORT = process.env.PORT || 3000;

//middleware
app.use(express.json());
app.use(cors());
app.use('/user', userRoutes); // This mounts all routes under '/user'
app.use('/uploads', express.static('uploads'));

//cek kalau backend jalan
app.get('/', (req: Request, res: Response) => {
  res.send('afl1clickergame backend is running');
});

//error handling
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: 'Route not found' });
});

//error handle middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

//starting server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
