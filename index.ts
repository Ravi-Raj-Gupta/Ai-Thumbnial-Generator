import express, { Request, Response } from "express";

const app = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
   res.send("Server is Live!");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
   console.log(`Server is running at http://localhost:${port}`);
});
