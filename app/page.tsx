import { redirect } from "next/navigation";

export default function Home(): never {
  // Workspace is the entire product — landing redirects there.
  redirect("/welcome");
}
