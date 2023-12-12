// Import SvelteKit framework resources.
import { get, readable } from "svelte/store"
import { browser } from "$app/environment"

// Import logger-related resources.
import pino, { type Logger } from "pino"
import fs from "fs"
import type { ServerConfig } from "$lib/shared/constants"
import { devMode } from "./appStores"


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
            level: get(devMode) ? "debug" : "info",
            base: undefined, // Removes "pid" and "hostname" from logs.
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
    const logFilePath = `${logsFolderPath}/rig_log.log`
    let logsLevel = serverConfig.logsLevel
    if (logsLevel !== null && !["trace", "debug", "info", "warn", "error", "fatal"].includes(logsLevel)) {
        console.log(`"${logsLevel}" is not a valid log level. Falling back to default log level.`)
        logsLevel = null
    }
    
    

    
    const transportConfig =
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
    
    // Create a Pino transport.
    const serverLoggerTransport = pino.transport(transportConfig)



    
    // Create the logger using that transport.
    logger = pino(
        {
            level: logsLevel || "info",
            base: undefined,
            timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
        },
        serverLoggerTransport
    )
}

// Initialize the store using the logger created above.
export const loggerStore = readable( logger )