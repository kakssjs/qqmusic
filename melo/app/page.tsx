import MeloExperience from "../components/melo/live/MeloExperience";
import { requireChatGPTUser } from "./chatgpt-auth";
export default async function Home() {
  await requireChatGPTUser("/");
  return <MeloExperience />;
}
