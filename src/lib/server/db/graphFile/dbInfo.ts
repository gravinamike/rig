import { v4 as uuidv4 } from "uuid"


export type DbInfoFieldValue = string | number | null

export interface TableInfo {
    "fields": {
        [ fieldName: string ]: string
    },
    "constraints": {
        [ fieldName: string ]: string
    },
    "defaultValues": {
        [ fieldName: string ]: DbInfoFieldValue
    },
    'entries': DbInfoFieldValue[][]
}

export interface DbInfo {
    [ tableName: string ]: TableInfo
}

export function getDbInfo(): DbInfo {
    const noneText = "(NONE)"
    const emptyObjectText = "{}"
    const dateTimeStamp = (new Date()).toISOString()

    const dbInfo: DbInfo = {

        "directions": {
            "fields": {
                "id": "bigint",
                "oppositeid": "integer",
                "text": "varchar(255)",
                "nameforobjects": "varchar(255)",
                "whencreated": "timestamp",
                "whenmodded": "timestamp",
                "directionorder": "integer"
            },
            "constraints": {
                "id": "PRIMARY KEY"
            },
            "defaultValues": {
                "text": "''(NONE)''",
                "nameforobjects": noneText,
                "whencreated": "NULL",
                "whenmodded": "NULL",
                "directionorder": 0
            },
            "entries": [
                [1, 1, "is related to", "relations", dateTimeStamp, dateTimeStamp, 1],
                [2, 2, "is synonym of", "synonyms", dateTimeStamp, dateTimeStamp, 2],
                [3, 3, "is opposite of", "opposites", dateTimeStamp, dateTimeStamp, 3],
                [4, 5, "is example of", "categories", dateTimeStamp, dateTimeStamp, 4],
                [5, 4, "is category of", "examples", dateTimeStamp, dateTimeStamp, 5],
                [6, 7, "is part of", "products", dateTimeStamp, dateTimeStamp, 6],
                [7, 6, "is made up of", "parts", dateTimeStamp, dateTimeStamp, 7],
                [8, 9, "leads to", "results", dateTimeStamp, dateTimeStamp, 8],
                [9, 8, "results from", "causes", dateTimeStamp, dateTimeStamp, 9],
                [10, 11, "elaborates", "abstractions", dateTimeStamp, dateTimeStamp, 10],
                [11, 10, "generalizes", "elaborations", dateTimeStamp, dateTimeStamp, 11]
            ]
        },

        "spaces": {
            "fields": {
                "id": "bigint",
                "text": "varchar(255)",
                "whencreated": "timestamp",
                "whenmodded": "timestamp",
                "spaceorder": "integer",
                "buildmethod": "varchar(255)"
            },
            "defaultValues": {
                "text": noneText,
                "whencreated": "NULL",
                "whenmodded": "NULL",
                "spaceorder": 0,
                "buildmethod": "radial"
            },
            "constraints": {
                "id": "PRIMARY KEY"
            },
            'entries': [
                [1, 'Definition', dateTimeStamp, dateTimeStamp, 1, "radial"],
                [2, 'Cause/Composition', dateTimeStamp, dateTimeStamp, 2, "radial"],
                [3, 'Composition/Abstraction', dateTimeStamp, dateTimeStamp, 3, "radial"]
            ]
        },

        "directiontospace": {
            "fields": {
                "id": "bigint",
                "directionid": "integer",
                "spaceid": "integer",
                "halfaxisid": "integer"
            },
            "constraints": {
                "id": "IDENTITY PRIMARY KEY"
            },
            "defaultValues": {
                "halfaxisid": 1
            },
            'entries': [
                [1, 7, 1, 1],
                [2, 5, 1, 3],

                [3, 8, 2, 1],
                [4, 7, 2, 3],

                [5, 7, 3, 1],
                [6, 11, 3, 3],
            ]
        },

        "things": {
            "fields": {
                "id": "bigint",
                "guid": "varchar(255)",
                "text": "varchar(255)",
                "perspectivetexts": "clob(2147483647)",
                "defaultplane": "integer",
                "perspectivedepths": "clob(2147483647)",
                "defaultcontentviewer": "varchar(255)",
                "whencreated": "timestamp",
                "whenvisited": "timestamp",
                "whenmodded": "timestamp"
            },
            "constraints": {
                "id": "IDENTITY PRIMARY KEY",
                "guid": "UNIQUE"
            },
            "defaultValues": {
                "text": noneText,
                "perspectivetexts": emptyObjectText,
                "defaultplane": 0,
                "defaultcontentviewer": "notes",
                "perspectivedepths": emptyObjectText,
                "whenvisited": "NULL",
                "whenmodded": "NULL"
            },
            'entries': [
                [
                    1, uuidv4(), "First Thing", emptyObjectText, 1, emptyObjectText, "notes", dateTimeStamp, null, dateTimeStamp
                ]
            ]
        },

        "relationships": {
            "fields": {
                "id": "bigint",
                "guid": "varchar(255)",
                "thingaid": "integer",
                "thingbid": "integer",
                "direction": "integer",
                "relationshiporder": "double(17)",
                "whencreated": "timestamp",
                "whenmodded": "timestamp",
            },
            "constraints": {
                "id": "IDENTITY PRIMARY KEY",
                "guid": "UNIQUE"
            },
            "defaultValues": {
                "direction": 1,
                "relationshiporder": 0.0,
                "whenmodded": null
            },
            'entries': []
        },

        "notes": {
            "fields": {
                "id": "bigint",
                "guid": "varchar(255)",
                "text": "clob(2147483647)",
                "whencreated": "timestamp",
                "whenmodded": "timestamp"
            },
            "constraints": {
                "id": "IDENTITY PRIMARY KEY",
                "guid": "UNIQUE"
            },
            "defaultValues": {
                "text": noneText
            },
            'entries': []
        },

        "notetothing": {
            "fields": {
                "id": "bigint",
                "noteid": "integer",
                "thingid": "integer"
            },
            "constraints": {
                "id": "IDENTITY PRIMARY KEY"
            },
            "defaultValues": {},
            'entries': []
        },

        "folders": {
            "fields": {
                "id": "bigint",
                "whencreated": "timestamp",
                "path": "varchar(255)"
            },
            "constraints": {
                "id": "IDENTITY PRIMARY KEY"
            },
            "defaultValues": {},
            'entries': []
        },

        "foldertothing": {
            "fields": {
                "id": "bigint",
                "folderid": "integer",
                "thingid": "integer"
            },
            "constraints": {
                "id": "IDENTITY PRIMARY KEY"
            },
            "defaultValues": {},
            'entries': []
        }

    }

    return dbInfo

}