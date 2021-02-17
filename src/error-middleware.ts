import Debug from "debug"
const debug = Debug("ac:error")


export const errorHandler = (config) => (error, request, response, next) => {
  debug("Final error handler : %o", error)
  error && response.status(500).json({
    error: error.message
  })
}
