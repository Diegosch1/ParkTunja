import axios from "./axios.js";

export const getReportRequest = (parkingId, from, to) =>
  axios.get(`/reports/${parkingId}/report?from=${from}&to=${to}`);
