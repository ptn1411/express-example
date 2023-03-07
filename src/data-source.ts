import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "h21766.tino.org",
    port: 3306,
    username: "phamthan_apidev",
    password: "]cu;X)BvTp5e",
    database: "phamthan_apidev",
    synchronize: true,
    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
    
})
