import { Request, Response } from "express";
import status from "http-status";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponce } from "../../shared/sendResponce";
import { PatientService } from "./patient.service";


const updateMyProfile = catchAsync(async (req: Request, res: Response) => {

  const user = req.user as IRequestUser;
  const payload = req.body;
  const result = await PatientService.updateMyProfile(user, payload);

  sendResponce(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Profile updated successfully",
    data: result
  });
})

export const PatientController = {
  updateMyProfile
}