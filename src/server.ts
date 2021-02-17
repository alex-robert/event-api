import { IConfig } from 'config'
import * as config from "config"

import Debug from "debug"


import * as express from "express"
import * as bodyParser from "body-parser"
import * as helmet from "helmet"
import * as passport from "passport"

const debug = Debug("ac:server")

export const server = (config: IConfig ): express.Application => {
  const app: express.Application = express()

  app.use(helmet())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())
  app.use(passport.initialize())

  return app
}

export const plug = (server: express.Application, path: string, controller) => {
  server.use(path, controller)
}

export const start = (config) => (server) => {
  debug("Starting server, %O", config)
  try {
    if(! config.port || ! config.host)
      throw new Error('Missing host or port in config')

    server.listen(config.port, () => debug(`app listening at ${config.host}:${config.port}`))
  } catch (error) {
    debug('Server cannot start, %s', error.message)
  }
}
