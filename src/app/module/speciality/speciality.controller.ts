import { Request, Response } from "express";
import { SpecialtyService } from "./speciality.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";



const createSpeciality = catchAsync(
  async (req: Request, res: Response) => {
    console.log(req.body);
    console.log(req.file);
    const payload = {
      ...req.body,
      icon: req.file?.path,
    }
    const result = await SpecialtyService.createSpeciality(payload);
    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Speciality Created Successfully",
      data: result
    })
  }
)

const getAllSpeciality = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SpecialtyService.getAllSpeciality();
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Speciality Retrive Successfully",
      data: result
    })
  }
)
const deleteSpeciality = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await SpecialtyService.deleteSpeciality(id as string);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Speciality Deleted Successfully",
      data: result
    })
  }
)
const updateSpeciality = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;
    const result = await SpecialtyService.updateSpeciality(id as string, payload);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Speciality Updated Successfully",
      data: result
    })
  }
)

export const SpecialtyController = {
  createSpeciality, getAllSpeciality, deleteSpeciality, updateSpeciality
}