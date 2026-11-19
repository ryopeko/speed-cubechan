import Main, { Title } from "@/components/Main";
import Practice from "@/components/Practice";
import { translate } from "@/i18n/messages";
import T, { DocTitle } from "@/i18n/T";

export const metadata = { title: translate("en", "practice.pageTitle") };

export default function PracticePage() {
  return (
    <Main>
      <DocTitle k="practice.pageTitle" />
      <Title>
        <T k="practice.title" />
      </Title>
      <Practice />
    </Main>
  );
}
