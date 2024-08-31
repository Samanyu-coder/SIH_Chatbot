import { Box, Avatar, Typography } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function extractCodeFromString(message: string) {
  if (message.includes("```")) {
    const blocks = message.split("```");
    return blocks.filter((block) => block.trim().length > 0);
  }
  return [];
}

function isCodeBlock(str: string) {
  return (
    str.includes("=") ||
    str.includes(";") ||
    str.includes("[") ||
    str.includes("]") ||
    str.includes("{") ||
    str.includes("}") ||
    str.includes("#") ||
    str.includes("//") ||
    str.includes("SELECT") ||
    str.includes("INSERT") ||
    str.includes("UPDATE") ||
    str.includes("DELETE") ||
    str.includes("|")
  );
}

const ChatItem = ({
  content,
  role,
}: {
  content: string;
  role: "user" | "assistant";
}) => {
  const messageBlocks = extractCodeFromString(content);
  const auth = useAuth();

  const getSyntaxLanguage = (block: string) => {
    if (block.includes("SELECT") || block.includes("INSERT") || block.includes("UPDATE") || block.includes("DELETE")) {
      return "sql";
    }
    return "javascript"; // Default to JavaScript if not SQL
  };

  return role === "assistant" ? (
    <Box
      sx={{
        display: "flex",
        p: 2,
        bgcolor: "#004d5612",
        gap: 2,
        borderRadius: 2,
        my: 1,
      }}
    >
      <Avatar sx={{ ml: "0" }}>
        <img src="openai.png" alt="openai" width={"30px"} />
      </Avatar>
      <Box>
        {!messageBlocks.length ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        ) : (
          messageBlocks.map((block, index) =>
            isCodeBlock(block) ? (
              block.includes("|") ? (
                <ReactMarkdown
                  key={index}
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ children }) => (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        {children}
                      </table>
                    ),
                    th: ({ children }) => (
                      <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {children}
                      </td>
                    ),
                  }}
                >
                  {block}
                </ReactMarkdown>
              ) : (
                <SyntaxHighlighter
                  key={index}
                  style={coldarkDark}
                  language={getSyntaxLanguage(block)}
                >
                  {block}
                </SyntaxHighlighter>
              )
            ) : (
              <Typography key={index} sx={{ fontSize: "20px" }}>
                {block}
              </Typography>
            )
          )
        )}
      </Box>
    </Box>
  ) : (
    <Box
      sx={{
        display: "flex",
        p: 2,
        bgcolor: "#004d56",
        gap: 2,
        borderRadius: 2,
      }}
    >
      <Avatar sx={{ ml: "0", bgcolor: "black", color: "white" }}>
        {auth?.user?.name[0]}
        {auth?.user?.name.split(" ")[1][0]}
      </Avatar>
      <Box>
        {!messageBlocks.length ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        ) : (
          messageBlocks.map((block, index) =>
            isCodeBlock(block) ? (
              block.includes("|") ? (
                <ReactMarkdown
                  key={index}
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ children }) => (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        {children}
                      </table>
                    ),
                    th: ({ children }) => (
                      <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {children}
                      </td>
                    ),
                  }}
                >
                  {block}
                </ReactMarkdown>
              ) : (
                <SyntaxHighlighter
                  key={index}
                  style={coldarkDark}
                  language={getSyntaxLanguage(block)}
                >
                  {block}
                </SyntaxHighlighter>
              )
            ) : (
              <Typography key={index} sx={{ fontSize: "20px" }}>
                {block}
              </Typography>
            )
          )
        )}
      </Box>
    </Box>
  );
};

export default ChatItem;
