require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000; // Port should be set after loading environment variables

const rootRouter = require("./routers/index");

app.use(cors());
app.use(express.json());

app.use("/api/v1", rootRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
