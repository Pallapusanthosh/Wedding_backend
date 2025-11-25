
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const normalize = require("./utils/normalize");
const app = express();
app.use(bodyParser.json());
app.use(cors());


const projectRoutes = require('./routes/projects');
const aliasRoutes = require('./routes/aliases');
const relationshipRoutes = require('./routes/relationships');
const titleRoutes = require('./routes/titles');
const peopleRoutes = require('./routes/people');

app.use((req, res, next) => {
  console.log("REQ:", req.method, req.url);
  next();
});


app.use("/api/projects", projectRoutes);
app.use("/api/aliases", aliasRoutes);
app.use("/api/relationships", relationshipRoutes);
app.use("/api/projects", titleRoutes); 
app.use("/api/people", peopleRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // console.log(normalize("Ashok anna"));
}
);