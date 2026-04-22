import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { DoctorService } from "./doctor.service";
import { sendResponce } from "../../shared/sendResponce";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";

const getAllDoctors = catchAsync(
  async (req: Request, res: Response) => {
    const query = req.query;
    const result = await DoctorService.getAllDoctors(query as IQueryParams);
    sendResponce(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "All Doctors Data Retrived",
      data: result.data,
      meta: result.meta,
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