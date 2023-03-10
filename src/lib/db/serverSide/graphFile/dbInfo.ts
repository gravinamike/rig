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
                [2, 2, "is idiomatic synonym of", "idiomatic synonyms", dateTimeStamp, dateTimeStamp, 2],
                [3, 3, "is analogous to", "analogues", dateTimeStamp, dateTimeStamp, 3],
                [4, 4, "is opposite of", "opposites", dateTimeStamp, dateTimeStamp, 4],
                [5, 6, "is exemplar of", "categories", dateTimeStamp, dateTimeStamp, 5],
                [6, 5, "is category of", "examples", dateTimeStamp, dateTimeStamp, 6],
                [7, 8, "constitutes", "products", dateTimeStamp, dateTimeStamp, 7],
                [8, 7, "comprises", "constituents", dateTimeStamp, dateTimeStamp, 8],
                [9, 10, "is set for category", "categories for set", dateTimeStamp, dateTimeStamp, 9],
                [10, 9, "is category for set", "sets for category", dateTimeStamp, dateTimeStamp, 10],
                [11, 12, "is means of", "ends", dateTimeStamp, dateTimeStamp, 11],
                [12, 11, "is end of", "means", dateTimeStamp, dateTimeStamp, 12],
                [13, 14, "describes", "model subjects", dateTimeStamp, dateTimeStamp, 13],
                [14, 13, "is described by", "models", dateTimeStamp, dateTimeStamp, 14],
                [15, 16, "elaborates", "abstractions", dateTimeStamp, dateTimeStamp, 15],
                [16, 15, "abstracts", "elaborations", dateTimeStamp, dateTimeStamp, 16]
            ]
        },

        "spaces": {
            "fields": {
                "id": "bigint",
                "text": "varchar(255)",
                "whencreated": "timestamp",
                "whenmodded": "timestamp",
                "spaceorder": "integer"
            },
            "defaultValues": {
                "text": noneText,
                "whencreated": "NULL",
                "whenmodded": "NULL",
                "spaceorder": 0
            },
            "constraints": {
                "id": "PRIMARY KEY"
            },
            'entries': [
                [1, 'Constitution/Category', dateTimeStamp, dateTimeStamp, 1],
                [2, 'Service/Representation', dateTimeStamp, dateTimeStamp, 2],
                [3, 'Representation/Abstraction', dateTimeStamp, dateTimeStamp, 3],
                [4, 'Service/Constitution', dateTimeStamp, dateTimeStamp, 4],
                [5, 'Service/Category', dateTimeStamp, dateTimeStamp, 5],
                [6, 'Service/Constitution/Category', dateTimeStamp, dateTimeStamp, 6]
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
                [2, 6, 1, 3],
                [3, 4, 1, 5],
                [4, null, 1, 7],

                [5, 11, 2, 1],
                [6, 13, 2, 3],
                [7, 8, 2, 5],
                [8, null, 2, 7],

                [9, 16, 3, 1],
                [10, 13, 3, 3],
                [11, 8, 3, 5],
                [12, null, 3, 7],

                [13, 11, 4, 1],
                [14, 7, 4, 3],
                [15, 4, 4, 5],
                [16, null, 4, 7],

                [17, 11, 5, 1],
                [18, 6, 5, 3],
                [19, 8, 5, 5],
                [20, null, 5, 7],

                [21, 11, 6, 1],
                [22, 8, 6, 3],
                [23, 6, 6, 5],
                [24, null, 6, 7]
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
                "perspectivedepths": emptyObjectText,
                "whenvisited": "NULL",
                "whenmodded": "NULL"
            },
            'entries': [
                [
                    1, uuidv4(), "--Graph origin--", emptyObjectText, 1, emptyObjectText, dateTimeStamp, null, dateTimeStamp
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