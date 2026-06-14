import { NextFunction, Request, Response } from "express";
import { IUpdatePatientInfoPayload, IUpdatePatientProfilePayload, IUpdatePatientHealthDataPayload } from "./patient.interface";

export const updateMyPatientProfileMiddleware = (req: Request, res: Response, next: NextFunction) => {

  if (req.body?.data) {
    req.body = JSON.parse(req.body.data);
  }

  const payload: IUpdatePatientProfilePayload = req.body;

  // Sanitize empty strings and null/undefined values
  if (payload.patientInfo) {
    Object.keys(payload.patientInfo).forEach(key => {
      const k = key as keyof IUpdatePatientInfoPayload;
      if (
        payload.patientInfo![k] === "" ||
        payload.patientInfo![k] === null ||
        payload.patientInfo![k] === undefined ||
        payload.patientInfo![k] as any === "null" ||
        payload.patientInfo![k] as any === "undefined"
      ) {
        delete payload.patientInfo![k];
      }
    });
  }

  if (payload.patientHealthData) {
    Object.keys(payload.patientHealthData).forEach(key => {
      const k = key as keyof IUpdatePatientHealthDataPayload;
      if (
        payload.patientHealthData![k] === "" ||
        payload.patientHealthData![k] === null ||
        payload.patientHealthData![k] === undefined ||
        payload.patientHealthData![k] as any === "null" ||
        payload.patientHealthData![k] as any === "undefined"
      ) {
        delete payload.patientHealthData![k];
      }
    });
  }

  const files = req.files as { [fieldName: string]: Express.Multer.File[] | undefined };

  if (files?.profilePhoto?.[0]) {
    if (!payload.patientInfo) {
      payload.patientInfo = {} as IUpdatePatientInfoPayload;
    }
    payload.patientInfo.profilePhoto = files.profilePhoto[0].path;
  }

  if (files?.medicalReports && files?.medicalReports.length > 0) {
    const newReports = files.medicalReports.map(file => ({
      reportName: file.originalname || `Medical Report - ${new Date().getTime()}`,
      reportLink: file.path,
    }))

    if (payload.medicalReports && Array.isArray(payload.medicalReports)) {
      payload.medicalReports = [...payload.medicalReports, ...newReports]
    } else {
      payload.medicalReports = newReports;
    }
  }
  console.log(payload);

  req.body = payload;
  console.log(req.body);

  next();
};