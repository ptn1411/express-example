import {
  Entity,
  Column,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
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

  @ManyToOne((_type) => Notifications)
  @JoinColumn() // this decorator is optional for @ManyToOne, but required for @OneToOne
  notification!: Notifications;

  @ManyToOne(() => User, (user) => user.userNotifications, {
    onDelete: "CASCADE",
  })
  user!: User;

  @Field()
  @Column()
  isRead!: boolean;
}
