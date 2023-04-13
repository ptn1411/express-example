import {
  BaseEntity,
  Entity,
  ManyToOne,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Device extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  agent!: string;

  @Column()
  ip!: string;

  @Column({
    type: "text",
  })
  subscription!: string;

  @ManyToOne(() => User, (user) => user.devices, { onDelete: "CASCADE" })
  user!: User;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createAt!: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  updateAt!: Date;
}
