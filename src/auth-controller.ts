import { IConfig } from 'config'

import * as passport from "passport"
import { Strategy as BearerStrategy } from "passport-http-bearer"
import * as jwt from "jsonwebtoken";

import * as express from "express"

import Debug from "debug"
const debug = Debug("ac:auth")


export const authController = (config: IConfig): express.Router => {
  const controller: express.Router = express.Router()

  passport.use(new BearerStrategy(
    async (token, done) => {
      debug('Verify bearer token')
      // Should go find and verify the user in an identity server, but I do a quick dev mockup here
      try {
        const payload = jwt.verify(token, config.auth.secret)
        debug("%O", payload)
        //@ts-ignore
        return done(null, payload, {scope: payload.role || "user"})
      } catch (err) {
        return done(err)
      }
    }
  ))

  controller.post('/login', async (request, response, next) => {
    debug('Fake authentication to get a user/admin token')

    // generate a fake user id that will be used to check ownership
    const userId = Math.floor(Math.random() * 1000)

    const role = request.query.role
    const token = jwt.sign({
        role,
        id: userId
      },
      config.auth.secret,
      {
        expiresIn: config.auth.expiration
      }
    )

    return response.json({ token })
  })

  return controller
}
