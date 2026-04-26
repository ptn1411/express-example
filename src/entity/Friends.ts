import {
  Entity,
  BaseEntity,
  Column,
  ManyToOne,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  Index,
  Unique,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { User } from "./User";
import { FriendRequest_Status } from "../types/Friends";

@ObjectType()
@Entity()
@Unique(["creator", "receiver"])
export class Friends extends BaseEntity {
  @Field((_type) => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @ManyToOne(() => User, (userEntity) => userEntity.sentFriendRequests)
  creator!: User;

  @Index()
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

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
