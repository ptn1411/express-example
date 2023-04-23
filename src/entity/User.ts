import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { ObjectType, Field } from "type-graphql";
import { Post } from "./Post";
import { Image } from "./Image";
import { Like } from "./Like";
import { Comment } from "./Comment";
import { Bookmark } from "./Bookmark";
import { Friends } from "./Friends";
import { Role } from "../constants";
import { MessageEntity } from "./Message";
import { Device } from "./Device";
import { ProfileUser } from "./Profile-user";
import { User_Status_Email } from "../types/User";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Field()
  @Column()
  phone!: string;

  @Column()
  password!: string;

  @Field()
  @Column()
  firstName!: string;

  @Field()
  @Column()
  lastName!: string;

  @Field()
  @Column()
  fullName!: string;

  @Field()
  @Column()
  birthday!: string;

  @Field()
  @Column()
  sex!: boolean;

  @Field()
  @Column()
  avatar!: string;

  @Field()
  @Column()
  coverImage!: string;

  @OneToMany(() => Post, (post) => post.user)
  posts!: Post[];

  @OneToMany(() => Image, (image) => image.user)
  images!: Image[];

  @OneToMany(() => Device, (device) => device.user)
  devices!: Device[];

  @OneToMany(() => Like, (like) => like.user)
  likes!: Like[];

  @OneToMany(() => Bookmark, (bookmark) => bookmark.user)
  bookmarks!: Bookmark[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments!: Comment[];

  @OneToMany(
    () => Friends,
    (friendRequestEntity) => friendRequestEntity.creator
  )
  sentFriendRequests!: Friends[];

  @OneToMany(
    () => Friends,
    (friendRequestEntity) => friendRequestEntity.receiver
  )
  receivedFriendRequests!: Friends[];

  @Field()
  @Column({ type: "enum", enum: Role, default: Role.USER })
  role!: Role;

  @OneToMany(() => MessageEntity, (messageEntity) => messageEntity.user)
  messages!: MessageEntity[];

  @OneToOne(() => ProfileUser, (profile) => profile.user)
  @JoinColumn()
  profile!: ProfileUser;

  @Field()
  @Column()
  statusEmail!: User_Status_Email;

  @Field()
  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createAt!: Date;

  @Field()
  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  updateAt!: Date;
}
