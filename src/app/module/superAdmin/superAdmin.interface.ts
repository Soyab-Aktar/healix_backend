import { Role } from "../../../generated/prisma/enums";

export interface ISuperAdminUpdatePayload {
  name?: string;
  profilePhoto?: string;
  contactNumber?: string;
}


export interface IChangeUserRolePayload {
  userId: string;
  role: Role;
}
