export interface NewFileCreationInfo{
    dialogOpen: boolean,
    username: string | null
    newFileName: string | null
}

export const nullNewFileCreationInfo: NewFileCreationInfo = {
    dialogOpen: false,
    username: null,
    newFileName: null
}