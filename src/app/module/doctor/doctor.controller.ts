import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { DoctorService } from "./doctor.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { Role } from "../../../generated/prisma/enums";

const getAllDoctors = catchAsync(
  async (req: Request, res: Response) => {
    const query = req.query;
    const result = await DoctorService.getAllDoctors(query as IQueryParams);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "All Doctors Data Retrieved",
      data: result.data,
      meta: result.meta,
    })
  }
)

const getDoctorsById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await DoctorService.getDoctorsById(id as string);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Doctor Data Retrieved",
      data: result
    })
  }
)
const softDeleteDoctor = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await DoctorService.softDeleteDoctor(id as string);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Doctor Deleted Successfully",
      data: result
    })
  }
)
const updateDoctorData = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;
    const user = req.user;

    if (user?.role === Role.DOCTOR) {
      const doc = await prisma.doctor.findUnique({ where: { id: id as string } });
      if (!doc || doc.userId !== user.userId) {
        throw new AppError(status.FORBIDDEN, "You are not authorized to update this doctor profile");
      }
    }

    const result = await DoctorService.updateDoctorData(id as string, payload);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Doctor Updated Successfully",
      data: result
    })
  }
)


export const DoctorController = {
  getAllDoctors, getDoctorsById, softDeleteDoctor, updateDoctorData,
}