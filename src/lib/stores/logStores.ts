// Import SvelteKit framework resources.
import { readable } from "svelte/store"
import { browser } from "$app/environment"

// Import logger-related resources.
import pino, { type Logger } from "pino"
import fs from "fs"
import type { ServerConfig } from "$lib/shared/constants"














/**
 * Logger store.
 * 
 * Holds a Pino logger for logging information to the console (and a log file if on the server).
 */


let logger: Logger
// If client-side, create a console-only logger.
if (browser) {
    logger = pino(
        {
            level: "trace",
            timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`
        }
    )

// Otherwise, create a console and (if logging to file was specified) log-file logger for server-
// side user.
} else {
    // Get the log folder path from the app config.
    const serverConfigPath = "./static/config/serverconfig.json"
    const serverConfigAsString = fs.readFileSync(serverConfigPath, "utf8")
    const serverConfig = JSON.parse(serverConfigAsString) as ServerConfig
    const logsFolderPath = serverConfig.logsFolder
    const logFilePath = `${logsFolderPath}/log.log`

    // Create a Pino transport.
    const serverLoggerTransport = pino.transport(
        // If logging to file is disabled, create a console-only logger.
        logsFolderPath === null ? {
            targets: [
                {
                    target: "pino-pretty" // Without a destination specified, logs to console.
                }
            ]
        } :

        // Otherwise, create a console and log-file logger.
        {
            targets: [
                {
                    target: "pino/file",
                    options: { destination: logFilePath }
                },
                {
                    target: "pino-pretty"
                }
            ]
        }
    )

    // Create the logger using that transport.
    logger = pino(
        {
            level: "trace",
            timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
        },
        serverLoggerTransport
    )
}

// Initialize the store using the logger created above.
export const loggerStore = readable( logger )