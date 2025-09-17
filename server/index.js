import app from "./app.js";
import { connectDB } from "./db.js";

const PORT = 3000;
connectDB();

app.listen(PORT, (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running, and App is listening on port " + PORT
    );
  else console.log("Error occurred, server can't start", error);
});
