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

const getDoctorsById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await DoctorService.getDoctorsById(id as string);
    sendResponce(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Doctor Data Retrived",
      data: result
    })
  }
)
const softDeleteDoctor = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await DoctorService.softDeleteDoctor(id as string);
    sendResponce(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Doctor Deleted successfully",
      data: result
    })
  }
)
const updateDoctorData = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;
    const result = await DoctorService.updateDoctorData(id as string, payload);
    sendResponce(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Doctor Deleted successfully",
      data: result
    })
  }
)


export const DoctorController = {
  getAllDoctors, getDoctorsById, softDeleteDoctor, updateDoctorData,
}