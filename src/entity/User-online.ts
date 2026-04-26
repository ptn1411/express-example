import {
  BaseEntity,
  Entity,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  Index,
} from "typeorm";
import { User } from "./User";

@Entity("user_online")
export class UserOnline extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @ManyToOne((_type) => User)
  @JoinColumn()
  user!: User;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  updateAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
