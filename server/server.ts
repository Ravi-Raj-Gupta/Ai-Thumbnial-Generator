import express, { Express, Request, Response } from "express";
import cors from "cors";

const app: Express = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
   res.send("Server is live");
});

app.listen(port, () => {
   console.log(`Server is running on port ${port}`);
});
