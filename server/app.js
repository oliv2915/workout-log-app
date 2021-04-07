require("dotenv").config();
const Express = require("express");
const app = Express();
const dbConnection = require("./db");

app.use(require("./middleware/headers")) // set headers to allow CORS
app.use(Express.json()); // enable JSON support app wide

const controllers = require("./controllers"); // handles all routes

app.use("/user", controllers.userController);
app.use("/log", controllers.logController);

dbConnection.authenticate()
    .then(dbConnection.sync())
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`[Server]: App running on port ${process.env.PORT}`)
        });
    })
    .catch(err => console.error(err))
