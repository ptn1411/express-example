import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Index,
} from "typeorm";
import { User } from "./User";

@Entity("active_conversation")
export class ActiveConversationEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  socketId!: string;

  @Index()
  @ManyToOne((_type) => User)
  @JoinColumn()
  user!: User;

  @Column()
  conversationId!: number;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createdAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
