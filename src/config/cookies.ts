import { Request, Response, NextFunction } from "express"

/**
 * Middleware to parse the cookies from the request headers
 * @param {Request} req The current HTTP request
 * @param {Response} res The current HTTP response
 * @param {NextFunction} next The next middleware in the stack
 */
const parseCookies = (req: Request, res: Response, next: NextFunction) => {
    const cookieHeader = req.headers.cookie

    req.cookies = cookieHeader ? parseCookiesFromHeader(cookieHeader) : {}
    next()
}

    /**
     * Parse the cookies from the given cookie header string
     * @param {string} cookieHeader The cookie header string
     * @returns {Record<string, string>} An object with the cookie names as keys and the values as values
     */
const parseCookiesFromHeader = (cookieHeader: string) => {
    const cookies: Record<string, string> = {}

    cookieHeader.split(";").forEach((cookie) => {
        const [key, value] = cookie.split("=")
        cookies[key.trim()] = value
    })
    return cookies
}

export { parseCookies }