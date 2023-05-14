// A user-credentials object with username and password.
export interface UserCredentials {
    username: string,
    hashedPassword: string
}

// A session-info object with session ID and username.
export interface SessionInfo {
    id: string,
    username: string
}