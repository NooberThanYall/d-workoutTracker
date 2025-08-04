import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Record } from "./entity/Record";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 55432,
  username: "postgres",
  password: "password",
  database: "dashaghiwt",
  synchronize: true,
  logging: ["error"],
  entities: [User, Record],
  migrations: [],
  subscribers: [],
});

//docker run --hostname=1cf7b51bfc4a --mac-address=86:42:ed:61:16:4a --env=POSTGRES_USER=postgres --env=POSTGRES_PASSWORD=password --env=POSTGRES_DB=dashaghiWT --env=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/lib/postgresql/17/bin --env=GOSU_VERSION=1.17 --env=LANG=en_US.utf8 --env=PG_MAJOR=17 --env=PG_VERSION=17.5-1.pgdg120+1 --env=PGDATA=/var/lib/postgresql/data --volume=/var/lib/postgresql/data --network=bridge -p 5432:5432 --restart=no --runtime=runc -d postgres
