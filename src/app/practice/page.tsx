import Main, { Title } from "@/components/Main";
import Practice from "@/components/Practice";

export const metadata = { title: "練習 | speed-cubechan" };

export default function PracticePage() {
  return (
    <Main>
      <Title>練習</Title>
      <Practice />
    </Main>
  );
}
