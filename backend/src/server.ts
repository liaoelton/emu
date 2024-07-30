import cors from "cors";
import "dotenv/config";
import express from "express";
import { errorHandler } from "./middlewares/errorHandler";
import blockRoutes from "./routes/blockRoutes";
import searchRoutes from "./routes/searchRoutes";
import slotRoutes from "./routes/slotRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import { connect_to_db } from "./utils/db";

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

app.use("/slot", slotRoutes);
app.use("/blocks", blockRoutes);
app.use("/txs", transactionRoutes);
app.use("/search", searchRoutes);

app.use(errorHandler);

connect_to_db().then(() =>
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    })
);
