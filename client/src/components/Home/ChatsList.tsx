import React from "react";
import { Stack, Typography, Input, Box, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useAppSelector } from "../../store";
import Center from "../common/Center";
import ChatListItem from "../Chat/ChatListItem";

const ChatsList = () => {
  const friends = useAppSelector((state) => state.friends);

  return (
    <Stack
      sx={{
        height: "100%",
        overflowY: "scroll",
        "::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      <Typography variant="h5" mb="32px">
        Chat
      </Typography>

      <Input
        disableUnderline
        fullWidth
        placeholder="Search messages or friends"
        sx={{
          p: "14px 18px 14px 14px",
          bgcolor: "grey.300",
          borderRadius: "0.6rem",
          mb: "15px",
        }}
        startAdornment={<SearchIcon sx={{ mr: "4px", color: "grey.500" }} />}
      />

      <Box sx={{ flexGrow: 1 }}>
        {friends.loading ? (
          <Center>
            <CircularProgress />
          </Center>
        ) : friends.error ? (
          <Center>
            <Typography color="error">{friends.error}</Typography>
          </Center>
        ) : (
          <Box>
            {friends.list.map((friend) => (
              <ChatListItem friend={friend} key={friend.id} />
            ))}
            {friends.list.map((friend) => (
              <ChatListItem friend={friend} key={friend.id} />
            ))}
          </Box>
        )}
      </Box>
    </Stack>
  );
};

export default ChatsList;
