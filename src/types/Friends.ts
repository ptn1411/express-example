export type FriendRequest_Status =
  | "not-sent"
  | "pending"
  | "accepted"
  | "declined"
  | "waiting-for-current-user-response";

export interface FriendRequestStatus {
  status?: FriendRequest_Status;
}
