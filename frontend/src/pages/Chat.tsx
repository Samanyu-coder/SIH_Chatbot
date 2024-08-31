import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Box, Avatar, Typography, Button, IconButton, Menu, MenuItem } from "@mui/material";
import red from "@mui/material/colors/red";
import { useAuth } from "../context/AuthContext";
import ChatItem from "../components/chat/Chatitem";
import { IoMdSend, IoMdMic } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import {
  deleteUserChats,
  getUserChats,
  sendChatRequest,
} from "../helpers/api-communicator";
import toast from "react-hot-toast";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const Chat = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const auth = useAuth();
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en-US"); // New state for selected language
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (!auth?.user) {
      return navigate("/login");
    }
  }, [auth]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      // Set the language based on the selectedLanguage state
      recognitionRef.current.lang = selectedLanguage;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        toast.success("Listening...", { id: "mic" });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        toast.dismiss("mic");
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        toast.error(`Error: ${event.error}`);
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        console.log("Transcript:", transcript);
        if (inputRef.current) {
          inputRef.current.value = transcript;
        }
      };
    } else {
      toast.error("Speech Recognition is not supported in this browser.");
    }
  }, [selectedLanguage]); // Re-run effect when the selected language changes

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang); // Update the selected language
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang;
      toast.success(`Language set to ${
        lang === "bn-IN"
          ? "Bengali"
          : lang === "hi-IN"
          ? "Hindi"
          : lang === "gu-IN"
          ? "Gujarati"
          : lang === "ta-IN"
          ? "Tamil"
          : lang === "te-IN"
          ? "Telugu"
          : "English"
      }`);
    }
    handleClose();
  };

  const handleSubmit = async () => {
    const content = inputRef.current?.value as string;
    if (inputRef && inputRef.current) {
      inputRef.current.value = "";
    }
    const newMessage: Message = { role: "user", content };
    setChatMessages((prev) => [...prev, newMessage]);
    const chatData = await sendChatRequest(content);
    setChatMessages([...chatData.chats]);
  };

  const handleDeleteChats = async () => {
    try {
      toast.loading("Deleting Chats", { id: "deletechats" });
      await deleteUserChats();
      setChatMessages([]);
      toast.success("Deleted Chats Successfully", { id: "deletechats" });
    } catch (error) {
      console.log(error);
      toast.error("Deleting chats failed", { id: "deletechats" });
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useLayoutEffect(() => {
    if (auth?.isLoggedIn && auth.user) {
      toast.loading("Loading Chats", { id: "loadchats" });
      getUserChats()
        .then((data) => {
          setChatMessages([...data.chats]);
          toast.success("Successfully loaded chats", { id: "loadchats" });
        })
        .catch((err) => {
          console.log(err);
          toast.error("Loading Failed", { id: "loadchats" });
        });
    }
  }, [auth]);

  // Function to handle key press events
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent the default action (form submission, etc.)
      handleSubmit(); // Call the handleSubmit function
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        width: "100%",
        height: "100%",
        mt: 3,
        gap: 3,
      }}
    >
      <Box
        sx={{
          display: { md: "flex", xs: "none", sm: "none" },
          flex: 0.2,
          flexDirection: "column",
          position: "relative", // Added to position the Select Language button
        }}
      >
        <Box
          sx={{
            display: "flex",
            width: "100%",
            height: "60vh",
            bgcolor: "rgb(17,29,39)",
            borderRadius: 5,
            flexDirection: "column",
            mx: 3,
          }}
        >
          <Avatar
            sx={{
              mx: "auto",
              my: 2,
              bgcolor: "white",
              color: "black",
              fontWeight: 700,
            }}
          >
            {auth?.user?.name[0]}
            {auth?.user?.name.split(" ")[1][0]}
          </Avatar>
          <Typography sx={{ mx: "auto", fontFamily: "work sans" }}>
            You are talking to a ChatBOT
          </Typography>
          <Typography sx={{ mx: "auto", fontFamily: "work sans", my: 4, p: 3 }}>
            You can ask some questions related to Knowledge, Business, Advice,
            Education, etc. But avoid sharing personal information.
          </Typography>
          <Button
            onClick={handleDeleteChats}
            sx={{
              width: "200px",
              my: "auto",
              color: "white",
              fontWeight: "700",
              borderRadius: 3,
              mx: "auto",
              bgcolor: red[300],
              ":hover": {
                bgcolor: red.A400,
              },
            }}
          >
            Clear Conversation
          </Button>
        </Box>
        <Box
          sx={{
            position: "absolute",
            bottom: 10, // Adjusted to position the button at the bottom
            left: 20,
            width: "100%", // Adjusted to ensure button stays within container
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            variant="contained"
            aria-controls={open ? "language-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
          >
            {selectedLanguage === "bn-IN"
              ? "Bengali"
              : selectedLanguage === "hi-IN"
              ? "Hindi"
              : selectedLanguage === "gu-IN"
              ? "Gujarati"
              : selectedLanguage === "ta-IN"
              ? "Tamil"
              : selectedLanguage === "te-IN"
              ? "Telugu"
              : "English"}
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flex: { md: 0.8, xs: 1, sm: 1 },
          flexDirection: "column",
          px: 3,
        }}
      >
        <Typography
          sx={{
            fontSize: "40px",
            color: "white",
            mb: 2,
            mx: "auto",
            fontWeight: "600",
          }}
        >
          Model - SIH 2024
        </Typography>
        <Box
          sx={{
            width: "100%",
            height: "60vh",
            borderRadius: 3,
            mx: "auto",
            display: "flex",
            flexDirection: "column",
            overflow: "scroll",
            overflowX: "hidden",
            overflowY: "auto",
            scrollBehavior: "smooth",
          }}
        >
          {chatMessages.map((chat, index) => (
            <ChatItem content={chat.content} role={chat.role} key={index} />
          ))}
        </Box>
        <div
          style={{
            width: "100%",
            borderRadius: 8,
            backgroundColor: "rgb(17,27,39)",
            display: "flex",
            margin: "auto",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            style={{
              width: "100%",
              backgroundColor: "transparent",
              padding: "30px",
              border: "none",
              outline: "none",
              color: "white",
              fontSize: "20px",
            }}
            onKeyDown={handleKeyPress} // Add the key press handler here
          />
          <IconButton onClick={handleMicClick} sx={{ color: "white" }}>
            {isListening ? <IoMdMic color="red" /> : <IoMdMic />}
          </IconButton>
          <IconButton onClick={handleSubmit} sx={{ color: "white" }}>
            <IoMdSend />
          </IconButton>
        </div>
      </Box>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        sx={{
          "& .MuiMenu-paper": {
            bgcolor: "rgb(17,29,39)",
            color: "white",
            maxHeight: "200px", // Limit height
            overflowY: "auto", // Enable scrolling for the menu
          },
        }}
      >
        <MenuItem onClick={() => handleLanguageChange("en-US")}>English</MenuItem>
        <MenuItem onClick={() => handleLanguageChange("bn-IN")}>Bengali</MenuItem>
        <MenuItem onClick={() => handleLanguageChange("hi-IN")}>Hindi</MenuItem>
        <MenuItem onClick={() => handleLanguageChange("gu-IN")}>Gujarati</MenuItem>
        <MenuItem onClick={() => handleLanguageChange("ta-IN")}>Tamil</MenuItem>
        <MenuItem onClick={() => handleLanguageChange("te-IN")}>Telugu</MenuItem>
      </Menu>
    </Box>
  );
};

export default Chat;
