import {
  BaseEntity,
  Entity,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  
} from "typeorm";
import { User } from "./User";

@Entity("user_online")
export class UserOnline extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne((_type) => User)
  @JoinColumn()
  user!: User;


  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  updateAt!: Date;
}
