import { Express, Logger } from "@hmcts/nodejs-logging";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as expressNunjucks from "express-nunjucks";
import * as path from "path";
import * as favicon from "serve-favicon";
//import { authCheckerUserOnlyFilter } from "./user/auth-checker-user-only-filter";
//import { Helmet, IConfig as HelmetConfig } from "./modules/helmet";
import { RouterFinder } from "../../main/router/routerFinder";
//import { serviceFilter } from "./service/service-filter";


const env = process.env.NODE_ENV || "development";
export const app: express.Express = express();
app.locals.ENV = env;

// TODO: adjust these values to your application
Logger.config({
  environment: process.env.NODE_ENV,
  microservice: "ccd-admin-web",
  team: "CCD",
});

// setup logging of HTTP requests
app.use(Express.accessLogger());

const logger = Logger.getLogger("app");

// secure the application by adding various HTTP headers to its responses

// view engine setup
app.set("view engine", "html");
app.set("views", [path.join(__dirname, "views"), path.join(__dirname, "/../../node_modules/govuk_template_jinja/views/layouts/")]);

app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "../../main/public/img/favicon.ico")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
//new Helmet(config.get<HelmetConfig>("security")).enableFor(app);

expressNunjucks(app);

// Allow application to work correctly behind a proxy (needed to pick up correct request protocol)
app.enable("trust proxy");

//app.all(/^\/(?!oauth2redirect|health).*$/, authCheckerUserOnlyFilter);
//app.all(/^\/(?!oauth2redirect|health).*$/, serviceFilter);
app.use("/", RouterFinder.findAll(path.join(__dirname, "../../main/routes")));

// returning "not found" page for requests with paths not resolved by the router
app.use((req, res) => {
  res.status(404);
  res.render("not-found");
});

// error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  logger.error(`${err.stack || err}`);

  // set locals
  res.locals.message = err.message;
  res.locals.error = err;

  res.status(err.status || 500);
  req.authentication ? res.render("home") : res.render("error");
});