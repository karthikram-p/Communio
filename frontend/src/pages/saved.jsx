import { useQuery } from "@tanstack/react-query";
import Post from "../components/common/Post";

const SavedPosts = () => {
  const { data: savedPosts, isLoading } = useQuery({
    queryKey: ["savedPosts"],
    queryFn: async () => {
      const res = await fetch("/api/posts/saved", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch saved posts");
      return res.json();
    },
  });

  return (
  <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 mt-6 ml-0 md:ml-28 pt-16 md:pt-0">
      <h1 className="text-2xl font-bold mb-6 text-white">Saved Posts</h1>
      {isLoading ? (
        <div className="text-gray-400">Loading...</div>
      ) : !savedPosts || savedPosts.length === 0 ? (
        <div className="text-gray-400">You have no saved posts.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {savedPosts.map((post) =>
            typeof post === "object" && post._id ? (
              <Post key={post._id} post={post} />
            ) : null
          )}
        </div>
      )}
    </div>
  );
};

export default SavedPosts;