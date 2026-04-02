import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { DoctorService } from "./doctor.service";
import { sendResponce } from "../../shared/sendResponce";
import status from "http-status";

const getAllDoctors = catchAsync(
  async (req: Request, res: Response) => {
    const result = await DoctorService.getAllDoctors();
    sendResponce(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "All Doctors Data Retrived",
      data: result
    })
  }
)


export const DoctorController = {
  getAllDoctors,
}