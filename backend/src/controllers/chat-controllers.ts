import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import axios from "axios";

const SESSION_ID = "hardcoded-session-id-12345";

export const generateChatCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message } = req.body;
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user)
      return res
        .status(401)
        .json({ message: "User not registered OR Token malfunctioned" });

    const chats = user.chats.map(({ role, content }) => ({
      role,
      content,
    }));
    chats.push({ content: message, role: "user" });
    user.chats.push({ content: message, role: "user" });

    // Prepare the data as per your specified format
    const payload = {
      question: message,
      language: "English",  // Assuming the language is always Hindi, otherwise make it dynamic
      sessionid: SESSION_ID
    };

    const response = await axios.post(
      "https://0ae5-14-194-176-244.ngrok-free.app/api/v1/query",
      payload
    );

    const chatResponse = response.data.response;

    user.chats.push({ content: chatResponse, role: "assistant" });
    await user.save();
    return res.status(200).json({ sessionId: SESSION_ID, chats: user.chats });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const sendChatsToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //user token check
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    return res.status(200).json({ message: "OK", sessionId: SESSION_ID, chats: user.chats });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};

export const deleteChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //user token check
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    //@ts-ignore
    user.chats = [];
    await user.save();
    return res.status(200).json({ message: "OK", sessionId: SESSION_ID });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};
