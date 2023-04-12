import {
  Entity,
  JoinTable,
  OneToMany,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BaseEntity,
} from "typeorm";
import { MessageEntity } from "./Message";
import { User } from "./User";

@Entity("conversation")
export class ConversationEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToMany(() => User)
  @JoinTable()
  users!: User[];

  @OneToMany(() => MessageEntity, (messageEntity) => messageEntity.conversation)
  messages!: MessageEntity[];

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  lastUpdated!: Date;
}
