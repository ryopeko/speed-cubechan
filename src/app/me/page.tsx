import Main, { Title } from "@/components/Main";
import Status from "@/components/Status";
import { translate } from "@/i18n/messages";
import T, { DocTitle } from "@/i18n/T";

export const metadata = { title: translate("en", "me.pageTitle") };

export default function MePage() {
  return (
    <Main>
      <DocTitle k="me.pageTitle" />
      <Title>
        <T k="me.title" />
      </Title>
      <Status />
    </Main>
  );
}
