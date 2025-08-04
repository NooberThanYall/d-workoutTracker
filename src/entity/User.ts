import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Record } from "./Record";

@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column('varchar')
    firstName: string

    @Column('varchar')
    tgId: string;

    @OneToMany(() => Record, (record) => record.user)
    records: Record[]

}
