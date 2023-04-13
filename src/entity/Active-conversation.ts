import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Entity("active_conversation")
export class ActiveConversationEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  socketId!: string;

  @ManyToOne((_type) => User)
  @JoinColumn()
  user!: User;

  @Column()
  conversationId!: number;
}
