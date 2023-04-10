import {
  Entity,
  BaseEntity,
  Column,
  ManyToOne,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { User } from "./User";
import { FriendRequest_Status } from "../types/Friends";

@ObjectType()
@Entity()
export class Friends extends BaseEntity {
  @Field((_type) => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (userEntity) => userEntity.sentFriendRequests)
  creator!: User;

  @ManyToOne(() => User, (userEntity) => userEntity.receivedFriendRequests)
  receiver!: User;

  @Field()
  @Column()
  status!: FriendRequest_Status;

  @Field()
  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createAt!: Date;
}
