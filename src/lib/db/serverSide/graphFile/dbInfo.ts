import { v4 as uuidv4 } from "uuid"


type DbInfoFieldValue = string | number | null

interface DbInfo {
    [ tableName: string ]: {
        "fields": {
            [ fieldName: string ]: string
        },
        "defaultValues": {
            [ fieldName: string ]: DbInfoFieldValue
        },
        'entries': DbInfoFieldValue[][]
    }
}

export function dbInfo(): DbInfo {
    const noneText = "''(NONE)''"
    const emptyObjectText = "'{}'"
    const dateTimeStamp = (new Date()).toISOString()

    const dbInfo: DbInfo = {

        "directions": {
            "fields": {
                "id": "bigint",
                "oppositeid": "integer",
                "text": "varchar(255)",
                "nameforobjects": "varchar(255)",
                "whencreated": "timestamp",
                "whenmodded": "timestamp"
            },
            "defaultValues": {
                "text": "''(NONE)''",
                "nameforobjects": noneText,
                "whencreated": "NULL",
                "whenmodded": "NULL"
            },
            "entries": [
                [1, 1, "is related to", "relations", dateTimeStamp, dateTimeStamp],
                [2, 2, "is idiomatic synonym of", "idiomatic synonyms", dateTimeStamp, dateTimeStamp],
                [3, 3, "is analogous to", "analogues", dateTimeStamp, dateTimeStamp],
                [4, 4, "is opposite of", "opposites", dateTimeStamp, dateTimeStamp],
                [5, 6, "is exemplar of", "categories", dateTimeStamp, dateTimeStamp],
                [6, 5, "is category of", "examples", dateTimeStamp, dateTimeStamp],
                [7, 8, "constitutes", "products", dateTimeStamp, dateTimeStamp],
                [8, 7, "comprises", "constituents", dateTimeStamp, dateTimeStamp],
                [9, 10, "is set for category", "categories for set", dateTimeStamp, dateTimeStamp],
                [10, 9, "is category for set", "sets for category", dateTimeStamp, dateTimeStamp],
                [11, 12, "is means of", "ends", dateTimeStamp, dateTimeStamp],
                [12, 11, "is end of", "means", dateTimeStamp, dateTimeStamp],
                [13, 14, "describes", "model subjects", dateTimeStamp, dateTimeStamp],
                [14, 13, "is described by", "models", dateTimeStamp, dateTimeStamp],
                [15, 16, "elaborates", "abstractions", dateTimeStamp, dateTimeStamp],
                [16, 15, "abstracts", "elaborations", dateTimeStamp, dateTimeStamp]
            ]
        },

        "spaces": {
            "fields": {
                "id": "bigint",
                "text": "varchar(255)",
                "whencreated": "timestamp",
                "whenmodded": "timestamp"
            },
            "defaultValues": {
                "text": noneText,
                "whencreated": "NULL",
                "whenmodded": "NULL"
            },
            'entries': [
                [1, 'Constitution/Category', dateTimeStamp, dateTimeStamp],
                [2, 'Service/Representation', dateTimeStamp, dateTimeStamp],
                [3, 'Representation/Abstraction', dateTimeStamp, dateTimeStamp],
                [4, 'Service/Constitution', dateTimeStamp, dateTimeStamp],
                [5, 'Service/Category', dateTimeStamp, dateTimeStamp],
                [6, 'Service/Constitution/Category', dateTimeStamp, dateTimeStamp]
            ]
        },

        "directiontospace": {
            "fields": {
                "id": "bigint",
                "directionid": "integer",
                "spaceid": "integer"
            },
            "defaultValues": {},
            'entries': [
                [1, 7, 1],
                [2, 6, 1],
                [3, 4, 1],
                [4, null, 1],

                [5, 11, 2],
                [6, 13, 2],
                [7, 8, 2],
                [8, null, 2],

                [9, 16, 3],
                [10, 13, 3],
                [11, 8, 3],
                [12, null, 3],

                [13, 11, 4],
                [14, 7, 4],
                [15, 4, 4],
                [16, null, 4],

                [17, 11, 5],
                [18, 6, 5],
                [19, 8, 5],
                [20, null, 5],

                [21, 11, 6],
                [22, 8, 6],
                [23, 6, 6],
                [24, null, 6]
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
                "text": "'clob(2147483647)",
                "whencreated": "timestamp",
                "whenmodded": "timestamp"
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
            "defaultValues": {},
            'entries': []
        },

        "folders": {
            "fields": {
                "id": "bigint",
                "whencreated": "timestamp",
                "path": "varchar(255)"
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
            "defaultValues": {},
            'entries': []
        }

    }

    return dbInfo

}