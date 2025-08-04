import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class Record {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("varchar")
  exercise: string;

  @Column('integer')
  reps: number;

  @Column('integer')
  weight: number;

  @ManyToOne(() => User, (user) => user.records)
  user: User;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}
