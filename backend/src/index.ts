import express from 'express';
import CORS from 'cors'
import { get_response } from './routes/get-response.js';

const app = express();

app.use(express.json());

app.use(CORS({
    origin: ["http://localhost:3000"]
}))

app.post(`/get-response`, get_response)

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port - ${PORT}`)
})