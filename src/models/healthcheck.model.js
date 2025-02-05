import mongoose, { mongo, Mongoose } from "mongoose";

const healthcheckSchema = new mongoose.Schema({
    name: String,
    age: Number

});

export const Healthcheck = mongoose.model("HealthCheck",healthcheckSchema)