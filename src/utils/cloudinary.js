import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
        folder: "assets",
    });
    // file has been uploaded successfull
    // console.log("file is uploaded on cloudinary ", response);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};
const destroyImageOnCloudinary = async (image) => {
  try {
    if (!image) return null;
    let updatedImage = path.basename(image, path.extname(image));
    console.log(updatedImage);
    

    const response = await cloudinary.uploader.destroy(`assets/${updatedImage}`);
    // console.log(response);
    return response;
  } catch (error) {
    return error;
  }
};
const destroyVideoOnCloudinary = async (video) => {
  try {
    if (!video) return null;
    let updatedVideo = path.basename(video, path.extname(video));
    console.log(updatedVideo);

    const response = await cloudinary.uploader.destroy(`assets/${updatedVideo}`, {
      resource_type: "video",
      type: "upload",
    });
    console.log(response);
    
    return response;
  } catch (error) {
    return error;
  }
};



export {
  uploadOnCloudinary,
  destroyImageOnCloudinary,
  destroyVideoOnCloudinary,
};