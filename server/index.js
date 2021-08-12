const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const trustRoutes = require("./routes/trust");

app.use("", trustRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
	console.log(`Server up and running on port ${port}`);
});
