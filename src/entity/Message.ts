import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ConversationEntity } from "./Conversation";
import { User } from "./User";
import { MessageType } from "../types/Message";

@Entity("message")
export class MessageEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  message!: string;

  @ManyToOne(() => User, (user) => user.messages)
  user!: User;

  @ManyToOne(
    () => ConversationEntity,
    (conversationEntity) => conversationEntity.messages
  )
  conversation!: ConversationEntity;

  @Column({ type: "enum", enum: MessageType, default: MessageType.TEXT })
  type!: MessageType;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createdAt!: Date;
}
