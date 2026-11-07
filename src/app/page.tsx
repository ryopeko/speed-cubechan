import Main, { Title } from "@/components/Main";
import PatternList from "@/components/PatternList";

export default function Home() {
  return (
    <Main>
      <Title>パターン一覧</Title>
      <PatternList />
    </Main>
  );
}
