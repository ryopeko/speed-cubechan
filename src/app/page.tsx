import Main, { Title } from "@/components/Main";
import PatternList from "@/components/PatternList";
import T, { DocTitle } from "@/i18n/T";

export default function Home() {
  return (
    <Main>
      <DocTitle k="site.name" />
      <Title>
        <T k="list.title" />
      </Title>
      <PatternList />
    </Main>
  );
}
