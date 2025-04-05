// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api", // gracias al proxy en package.json, apunta a localhost:3001
});

export default api;
