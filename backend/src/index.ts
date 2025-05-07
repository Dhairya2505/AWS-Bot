import express from 'express';
import CORS from 'cors'
import cookieParser from 'cookie-parser'
import { get_response } from './routes/get-response.js';
import { valid_token } from './routes/valid_token.js';
import UserDuplicacy from './middlewares/UserDuplicacy.js';
import CheckUser from './middlewares/CheckUser.js';
import { signup } from './routes/signup.js';
import { signin } from './routes/signin.js';
import { get_chats } from './routes/get-chats.js';

const app = express();

app.use(express.json());

app.use(CORS({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
}))

app.use(cookieParser())
app.use(express.json())

app.post(`/get-response`, get_response)
app.post('/signup', UserDuplicacy, signup)
app.get(`/signin`, CheckUser, signin)
app.get(`/valid_token`, valid_token)
app.get(`/chats`, get_chats)

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port - ${PORT}`)
})