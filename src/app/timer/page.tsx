import Main, { Title } from "@/components/Main";
import Timer from "@/components/Timer";
import { translate } from "@/i18n/messages";
import T, { DocTitle } from "@/i18n/T";

export const metadata = { title: translate("en", "timer.pageTitle") };

export default function TimerPage() {
  return (
    <Main>
      <DocTitle k="timer.pageTitle" />
      <Title>
        <T k="timer.title" />
      </Title>
      <Timer />
    </Main>
  );
}
