import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("active_conversation")
export class ActiveConversationEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  socketId!: string;

  @Column()
  userId!: string;

  @Column()
  conversationId!: number;
}
