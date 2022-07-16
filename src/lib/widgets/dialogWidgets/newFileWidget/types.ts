export interface NewFileCreationInfo{
    dialogOpen: boolean,
    newFileName: string | null
}

export const nullNewFileCreationInfo: NewFileCreationInfo = {
    dialogOpen: false,
    newFileName: null
}