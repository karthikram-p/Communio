import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useDirectChats = (enabled = true) => {
  return useQuery({
    queryKey: ["directChats"],
    enabled,
    queryFn: async () => {
      const res = await axios.get("/api/direct/chats", {
        withCredentials: true,
      });
      return res.data;
    },
  });
};
