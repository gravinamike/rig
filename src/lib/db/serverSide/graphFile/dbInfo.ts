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

        "graphinfo": {
            "fields": {
                "id": "bigint",
                "guid": "varchar(255)"
            },
            "defaultValues": {},
            'entries': [
                ['1', uuidv4()],
            ]
        },

        "directions": {
            "fields": {
                "id": "bigint",
                "oppositeid": "integer",
                "symbolthingid": "integer",
                "text": "varchar(255)",
                "nameforobjects": "varchar(255)",
                "depthdelta": "integer",
                "inheritcolor": "integer",
                "inheritalpha": "integer",
                "inheritlayer": "integer",
                "encapsulation": "integer",
                "whencreated": "timestamp",
                "whenmodded": "timestamp",
                "access": "integer",
            },
            "defaultValues": {
                "symbolthingid": null,
                "text": "''(NONE)''",
                "nameforobjects": noneText,
                "whencreated": "NULL",
                "whenmodded": "NULL",
                "access": 0
            },
            "entries": [
                [1, 1, 3, "is related to", "relations", 0, 0, 0, 0, 0, dateTimeStamp, dateTimeStamp, 0],
                [2, 2, 4, "is idiomatic synonym of", "idiomatic synonyms", 0, 0, 0, 0, 0, dateTimeStamp, dateTimeStamp, 0],
                [3, 3, 5, "is analogous to", "analogues", 0, 0, 0, 0, 0, dateTimeStamp, dateTimeStamp, 0],
                [4, 4, 6, "is opposite of", "opposites", 0, 0, 0, 0, 0, dateTimeStamp, dateTimeStamp, 0],
                [5, 6, 7, "is exemplar of", "categories", 0, 0, 0, 0, 0, dateTimeStamp, dateTimeStamp, 0],
                [6, 5, 8, "is category of", "examples", 0, 0, 0, 0, 0, dateTimeStamp, dateTimeStamp, 0],
                [7, 8, 9, "constitutes", "products", 0, 0, 0, 0, 0, dateTimeStamp, dateTimeStamp, 0],
                [8, 7, 10, "comprises", "constituents", 0, 0, 0, 0, 0, dateTimeStamp, dateTimeStamp, 0],
                [9, 10, 11, "is set for category", "categories for set", 0, 0, 0, 0, 0, dateTimeStamp, dateTimeStamp, 0],
                [10, 9, 12, "is category for set", "sets for category", 0, 0, 0, 0, 0, dateTimeStamp, dateTimeStamp, 0],
                [11, 12, 13, "is means of", "ends", 0, 0, 0, 0, 0, dateTimeStamp, dateTimeStamp, 0],
                [12, 11, 14, "is end of", "means", 0, 0, 0, 0, 0, dateTimeStamp, dateTimeStamp, 0],
                [13, 14, 15, "describes", "model subjects", 0, 0, 0, 0, 0, dateTimeStamp, dateTimeStamp, 0],
                [14, 13, 16, "is described by", "models", 0, 0, 0, 0, 0, dateTimeStamp, dateTimeStamp, 0],
                [15, 16, 17, "elaborates", "abstractions", 0, 0, 0, 0, 0, dateTimeStamp, dateTimeStamp, 0],
                [16, 15, 18, "abstracts", "elaborations", 0, 0, 0, 0, 0, dateTimeStamp, dateTimeStamp, 0]
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
                "ensystems": "integer",
                "depthprofile": "clob(2147483647)",
                "perspectivedepths": "clob(2147483647)",
                "formula": "clob(2147483647)",
                "lastformulated": "timestamp",
                "fillcolor": "varchar(255)",
                "stackbehavior": "varchar(255)",
                "xoffset": "integer",
                "yoffset": "integer",
                "zoffset": "integer",
                "sizemultiplier": "double(17)",
                "taskactivity": "integer",
                "taskactivityreps": "integer",
                "whencreated": "timestamp",
                "whenvisited": "timestamp",
                "whenmodded": "timestamp",
                "whentrashed": "timestamp",
                "access": "integer",
                "portalperspectivethingid": "integer",
                "portaldefaultspaceid": "integer",
                "perspectiveviewers": "clob(2147483647)"
            },
            "defaultValues": {
                "text": noneText,
                "perspectivetexts": emptyObjectText,
                "defaultplane": 0,
                "depthprofile": emptyObjectText,
                "perspectivedepths": emptyObjectText,
                "formula": emptyObjectText,
                "sizemultiplier": 1.0,
                "taskactivityreps": 1,
                "whenvisited": "NULL",
                "whenmodded": "NULL",
                "whentrashed": "NULL",
                "access": 0,
                "portalperspectivethingid": "NULL",
                "portaldefaultspaceid": "NULL",
                "perspectiveviewers": emptyObjectText
            },
            'entries': [
                [
                    1, uuidv4(), "--Graph origin--", emptyObjectText, 1, 0, emptyObjectText, emptyObjectText, emptyObjectText, dateTimeStamp,
                    null, null, 0, 0, 0, 1.0, 0, 1, dateTimeStamp, null, dateTimeStamp, null, 0, null, null
                ],
                [
                    2, uuidv4(), "--Set of Graph Directions--", emptyObjectText, 1, 0, emptyObjectText, emptyObjectText, emptyObjectText, dateTimeStamp,
                    null, null, 0, 0, 0, 1.0, 0, 1, dateTimeStamp, null, dateTimeStamp, null, 0, null, null
                ],
                [
                    3, uuidv4(), "is related to", emptyObjectText, 1, 0, emptyObjectText, emptyObjectText, emptyObjectText, dateTimeStamp,
                    null, null, 0, 0, 0, 1.0, 0, 1, dateTimeStamp, null, dateTimeStamp, null, 0, null, null
                ],
                [
                    4, uuidv4(), "is idiomatic synonym of", emptyObjectText, 1, 0, emptyObjectText, emptyObjectText, emptyObjectText, dateTimeStamp,
                    null, null, 0, 0, 0, 1.0, 0, 1, dateTimeStamp, null, dateTimeStamp, null, 0, null, null
                ],
                [
                    5, uuidv4(), "is analogous to", emptyObjectText, 1, 0, emptyObjectText, emptyObjectText, emptyObjectText, dateTimeStamp,
                    null, null, 0, 0, 0, 1.0, 0, 1, dateTimeStamp, null, dateTimeStamp, null, 0, null, null
                ],
                [
                    6, uuidv4(), "is opposite of", emptyObjectText, 1, 0, emptyObjectText, emptyObjectText, emptyObjectText, dateTimeStamp,
                    null, null, 0, 0, 0, 1.0, 0, 1, dateTimeStamp, null, dateTimeStamp, null, 0, null, null
                ],
                [
                    7, uuidv4(), "is exemplar of", emptyObjectText, 1, 0, emptyObjectText, emptyObjectText, emptyObjectText, dateTimeStamp,
                    null, null, 0, 0, 0, 1.0, 0, 1, dateTimeStamp, null, dateTimeStamp, null, 0, null, null
                ],
                [
                    8, uuidv4(), "is category of", emptyObjectText, 1, 0, emptyObjectText, emptyObjectText, emptyObjectText, dateTimeStamp,
                    null, null, 0, 0, 0, 1.0, 0, 1, dateTimeStamp, null, dateTimeStamp, null, 0, null, null
                ],
                [
                    9, uuidv4(), "constitutes", emptyObjectText, 1, 0, emptyObjectText, emptyObjectText, emptyObjectText, dateTimeStamp,
                    null, null, 0, 0, 0, 1.0, 0, 1, dateTimeStamp, null, dateTimeStamp, null, 0, null, null
                ],
                [
                    10, uuidv4(), "comprises", emptyObjectText, 1, 0, emptyObjectText, emptyObjectText, emptyObjectText, dateTimeStamp,
                    null, null, 0, 0, 0, 1.0, 0, 1, dateTimeStamp, null, dateTimeStamp, null, 0, null, null
                ],
                [
                    11, uuidv4(), "is set for category", emptyObjectText, 1, 0, emptyObjectText, emptyObjectText, emptyObjectText, dateTimeStamp,
                    null, null, 0, 0, 0, 1.0, 0, 1, dateTimeStamp, null, dateTimeStamp, null, 0, null, null
                ],
                [
                    12, uuidv4(), "is category for set", emptyObjectText, 1, 0, emptyObjectText, emptyObjectText, emptyObjectText, dateTimeStamp,
                    null, null, 0, 0, 0, 1.0, 0, 1, dateTimeStamp, null, dateTimeStamp, null, 0, null, null
                ],
                [
                    13, uuidv4(), "is means of", emptyObjectText, 1, 0, emptyObjectText, emptyObjectText, emptyObjectText, dateTimeStamp,
                    null, null, 0, 0, 0, 1.0, 0, 1, dateTimeStamp, null, dateTimeStamp, null, 0, null, null
                ],
                [
                    14, uuidv4(), "is end of", emptyObjectText, 1, 0, emptyObjectText, emptyObjectText, emptyObjectText, dateTimeStamp,
                    null, null, 0, 0, 0, 1.0, 0, 1, dateTimeStamp, null, dateTimeStamp, null, 0, null, null
                ],
                [
                    15, uuidv4(), "describes", emptyObjectText, 1, 0, emptyObjectText, emptyObjectText, emptyObjectText, dateTimeStamp,
                    null, null, 0, 0, 0, 1.0, 0, 1, dateTimeStamp, null, dateTimeStamp, null, 0, null, null
                ],
                [
                    16, uuidv4(), "is described by", emptyObjectText, 1, 0, emptyObjectText, emptyObjectText, emptyObjectText, dateTimeStamp,
                    null, null, 0, 0, 0, 1.0, 0, 1, dateTimeStamp, null, dateTimeStamp, null, 0, null, null
                ],
                [
                    17, uuidv4(), "elaborates", emptyObjectText, 1, 0, emptyObjectText, emptyObjectText, emptyObjectText, dateTimeStamp,
                    null, null, 0, 0, 0, 1.0, 0, 1, dateTimeStamp, null, dateTimeStamp, null, 0, null, null
                ],
                [
                    18, uuidv4(), "abstracts", emptyObjectText, 1, 0, emptyObjectText, emptyObjectText, emptyObjectText, dateTimeStamp,
                    null, null, 0, 0, 0, 1.0, 0, 1, dateTimeStamp, null, dateTimeStamp, null, 0, null, null
                ],
            ]
        },

        "relationships": {
            "fields": {
                "id": "bigint",
                "guid": "varchar(255)",
                "thingaid": "integer",
                "thingbid": "integer",
                "direction": "integer",
                "meta": "integer",
                "relationshiporder": "double(17)",
                "ensystemed": "integer",
                "text": "varchar(255)",
                "whencreated": "timestamp",
                "whenmodded": "timestamp",
                "whentrashed": "timestamp",
                "access": "integer"
            },
            "defaultValues": {
                "direction": 1,
                "meta": 0,
                "relationshiporder": 0.0,
                "ensystemed": 0,
                "text": noneText,
                "whenmodded": null,
                "whentrashed": null,
                "access": 0
            },
            'entries': [
                [
                    1, uuidv4(), 1, 2, 1, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    2, uuidv4(), 2, 1, 1, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    3, uuidv4(), 2, 3, 8, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    4, uuidv4(), 3, 2, 7, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    5, uuidv4(), 2, 4, 8, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    6, uuidv4(), 4, 2, 7, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    7, uuidv4(), 2, 5, 8, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    8, uuidv4(), 5, 2, 7, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    9, uuidv4(), 2, 6, 8, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    10, uuidv4(), 6, 2, 7, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    11, uuidv4(), 2, 7, 8, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    12, uuidv4(), 7, 2, 7, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    13, uuidv4(), 2, 8, 8, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    14, uuidv4(), 8, 2, 7, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    15, uuidv4(), 2, 9, 8, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    16, uuidv4(), 9, 2, 7, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    17, uuidv4(), 2, 10, 8, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    18, uuidv4(), 10, 2, 7, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    19, uuidv4(), 2, 11, 8, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    20, uuidv4(), 11, 2, 7, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    21, uuidv4(), 2, 12, 8, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    22, uuidv4(), 12, 2, 7, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    23, uuidv4(), 2, 13, 8, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    24, uuidv4(), 13, 2, 7, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    25, uuidv4(), 2, 14, 8, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    26, uuidv4(), 14, 2, 7, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    27, uuidv4(), 2, 15, 8, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    28, uuidv4(), 15, 2, 7, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    29, uuidv4(), 2, 16, 8, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    30, uuidv4(), 16, 2, 7, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    31, uuidv4(), 2, 17, 8, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    32, uuidv4(), 17, 2, 7, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    33, uuidv4(), 2, 18, 8, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
                [
                    34, uuidv4(), 18, 2, 7, 0, 0.0, 0, null,
                    dateTimeStamp, null, null, 0
                ],
            ]
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
        },

        "relationshiptosystem": {
            "fields": {
                "id": "bigint",
                "idr": "integer",
                "ids": "integer"
            },
            "defaultValues": {},
            'entries': []
        },

        "structures": {
            "fields": {
                "id": "bigint",
                "formula": "clob(2147483647)"
            },
            "defaultValues": {},
            'entries': []
        },

        "implications": {
            "fields": {
                "id": "bigint",
                "structureida": "integer",
                "structureidb": "integer"
            },
            "defaultValues": {},
            'entries': []
        },

    }

    return dbInfo

}