import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/api/axios";
import axios, { AxiosError } from "axios";

interface IEnrollRequest {
  enrollCode: string;
}

export interface IEnrollResponse {
  success: boolean;
  message: string;
  status: string;
  data: {
    classId: string;
  };
}

export const enrollClass = createAsyncThunk<
  IEnrollResponse,
  IEnrollRequest,
  { rejectValue: { message: string; status?: string } }
>(
  "classes/enroll",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post<IEnrollResponse>(
        "/classes/enroll",
        payload
      );
// console.log("Data: ", data);
      return data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const err = error as AxiosError<{
          message?: string;
          status?: string;
        }>;

        return rejectWithValue({
          message:
            err.response?.data?.message ||
            err.message ||
            "Something went wrong",
          status: err.response?.data?.status,
        });
      }

      if (error instanceof Error) {
        return rejectWithValue({
          message: error.message,
        });
      }

      return rejectWithValue({
        message: "Unexpected error occurred",
      });
    }
  }
);