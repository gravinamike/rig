export function filenameIsValid( filename: string ): boolean {
    const validCharactersRegex = /^[-_a-z0-9]+$/i

    const valid =
        (
            filename !== ""
            && !validCharactersRegex.test(filename)
        ) ? false :
        true
        
    return valid
}