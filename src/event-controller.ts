import { IConfig } from 'config'

import * as express from "express"
import * as passport from "passport"

import { eventModel, EventStatus } from "./event-model"
import { param, body, validationResult } from 'express-validator'

import Debug from "debug"
const debug = Debug("ac:controller")

const validator_handler = (request, response, next) => {
  const errors = validationResult(request)
  if (!errors.isEmpty()) {
    debug('Invalid request error: %o', errors.array())
    response.status(422).json({
      errors: errors.array().map(error => `${error.param} : ${error.msg}`)
    })
  } else {
    next()
  }
}


export const eventController = (config: IConfig): express.Router => {
  const controller: express.Router = express.Router()

  const idValidator = [param('id').isMongoId()]
  const bodyValidator = [
    body('description').escape().trim(),
    body('start_date').isNumeric(),
    body('end_date').isNumeric(),
    body('reminder').isNumeric(),
    body('status').isIn(Object.values(EventStatus))
  ]

  // There is a way to handle scope directly in passport Oauth Middleware, but not with a simple bearer strategy
  // In a real world project, we of courses would be using a real Oauth2 server with proper scope management
  const check_admin_scope = (request, response, next) => {
    request.authInfo.scope === "admin" && next()
    response.status(403).send()
  }

  const create_handler = (id) => async (request, response, next) => {
    await eventModel(config).then((model) => {
      model.create({ ...request.body, ownerId: id })
        .then((result) => {
          result && response.status(201).json(result)
          !result && next(new Error('Cannot create Event'))
        })
        .catch((error) => next(error))
    })
  }

  controller.use(passport.authenticate('bearer', { session: false }))

  /**
   *  @api {get} /events/:id
   *  @apiName GetEvent
   *  @apiGroup Events
   *
   *  @apiParam {String} [id] Event id
   */
  controller.get('/:id', idValidator, validator_handler, async (request, response, next) => {
    await eventModel(config).then((model) => {
      debug('Get document %s', request.params['id'])
      model.find_one_by_id(request.params['id'])
      .then((event) => response.status(200).json(event))
      .catch((error) => next(error))
    })
  })

  /**
  *  @api {post} /events
  *  @apiName CreateEvent
  *  @apiGroup Events
  *
  *  @apiParam (Request body) {Number} [start_date] Event strat date (timestamp)
  *  @apiParam (Request body) {Number} [end_date]  Event end date (timestamp)
  *  @apiParam (Request body) {String} [description] Event description
  *  @apiParam (Request body) {Number} [reminder] Event reminder timing
  *  @apiParam (Request body) {String} [status] Event Status, One of GOING,MAYBE,UNAVAILABLE
  */
  controller.post('/', bodyValidator, validator_handler, async (request, response, next) => {
    create_handler(request.user.id)(request, response, next)
  })

  /**
  *  @api {post} /events
  *  @apiName CreateEvent
  *  @apiGroup Events
  *
  *   Create an event on behalf of another user
  *
  *  @apiParam {String} [id] Event Owner id
  *  @apiParam (Request body) {Number} [start_date] Event strat date (timestamp)
  *  @apiParam (Request body) {Number} [end_date]  Event end date (timestamp)
  *  @apiParam (Request body) {String} [description] Event description
  *  @apiParam (Request body) {Number} [reminder] Event reminder timing
  *  @apiParam (Request body) {String} [status] Event Status, One of GOING,MAYBE,UNAVAILABLE
  */
  controller.post('/:id',check_admin_scope, bodyValidator, validator_handler, async (request, response, next) => {
    create_handler(parseInt(request.params['id']))(request, response, next)
  })

  /**
  *  @api {put} /events/:id
  *  @apiName UpdateEvent
  *  @apiGroup Events
  *
  *  @apiParam {String} [id] Event id
  *  @apiParam (Request body) {Number} [start_date] Event strat date (timestamp)
  *  @apiParam (Request body) {Number} [end_date]  Event end date (timestamp)
  *  @apiParam (Request body) {String} [description] Event description
  *  @apiParam (Request body) {Number} [reminder] Event reminder timing
  *  @apiParam (Request body) {String} [status] Event Status, One of GOING,MAYBE,UNAVAILABLE
  */
  controller.put('/:id', idValidator, bodyValidator, validator_handler, async (request, response, next) => {
    await eventModel(config).then((model) => {
      model.find_one_by_id(request.params['id']).then((result) => {
        (result && (request.authInfo.scope === "admin" || request.user.id === result.ownerId)) &&
        model.update(request.params['id'], { ...request.body })
          .then((result) => {
            result && response.status(204).send()
            !result && response.status(404).send()
          })
          || response.status(403).json({error: "Operation not allowed"})
      })

       .catch((error) => next(error))
    })
  })

  /**
  *  @api {delete} /events/:id
  *  @apiName DeleteEvent
  *  @apiGroup Events
  *
  *  @apiParam {String} [id] Event id
  */
  controller.delete('/:id', bodyValidator, validator_handler, async (request, response, next) => {
    await eventModel(config).then((model) => {
      model.delete(request.params['id'])
      .then((isDeleted) => {
        isDeleted && response.status(204).send() || response.status(404).send()
      })
      .catch((error) => next(error))
    })
  })

  return controller
}
