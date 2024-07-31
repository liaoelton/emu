import cors from "cors";
import "dotenv/config";
import express from "express";
import expressRateLimit from "express-rate-limit";
import { errorHandler } from "./middlewares/errorHandler";
import blockRoutes from "./routes/blockRoutes";
import searchRoutes from "./routes/searchRoutes";
import slotRoutes from "./routes/slotRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import { connect_to_db } from "./utils/db";

const app = express();
const port = 3001;
const apiLimiter = expressRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(express.json());
app.use(cors());
app.use(apiLimiter);

app.use("/slot", slotRoutes);
app.use("/blocks", blockRoutes);
app.use("/txs", transactionRoutes);
app.use("/search", searchRoutes);

app.get("/healthz", (req, res) => {
    res.status(200).json({ status: "healthy", message: "I am happy and healthy" });
});

app.use(errorHandler);

connect_to_db().then(() =>
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    })
);
