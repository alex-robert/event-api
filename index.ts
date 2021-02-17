import * as config from "config"

import { server, plug, start } from "./src/server"
import { eventController } from "./src/event-controller"
import { authController } from "./src/auth-controller"


const app = server(config)

plug(app, '/auth', authController(config))
plug(app, '/event', eventController(config))

start(config)(app)
