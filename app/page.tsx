import HomeClient from "@/components/HomeClient"
import { getRecentPosts } from "@/lib/mdx"

export default function Home() {
  const recentPosts = getRecentPosts(4)

  return <HomeClient recentPosts={recentPosts} />
}
