import {
  Entity,
  Column,
  BaseEntity,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Index,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { User } from "./User";
import { Notifications } from "./Notifications";
@ObjectType()
@Entity()
export class UserNotifications extends BaseEntity {
  @Field((_type) => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @ManyToOne((_type) => Notifications)
  @JoinColumn()
  notification!: Notifications;

  @Index()
  @ManyToOne(() => User, (user) => user.userNotifications, {
    onDelete: "CASCADE",
  })
  user!: User;

  @Field()
  @Column()
  isRead!: boolean;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
