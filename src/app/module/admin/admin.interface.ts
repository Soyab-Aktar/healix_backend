import { UserStatus } from "../../../generated/prisma/enums";

export interface IAdminUpdatePayload {
  name?: string;
  profilePhoto?: string;
  contactNumber?: string;
}

export interface IChangeUserStatusPayload {
  userId: string;
  userStatus: UserStatus;
}