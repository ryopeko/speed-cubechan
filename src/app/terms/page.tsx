import Main, { Title } from "@/components/Main";
import Terms from "@/components/Terms";
import { translate } from "@/i18n/messages";
import T, { DocTitle } from "@/i18n/T";

export const metadata = { title: translate("en", "terms.pageTitle") };

export default function TermsPage() {
  return (
    <Main>
      <DocTitle k="terms.pageTitle" />
      <Title>
        <T k="terms.title" />
      </Title>
      <Terms />
    </Main>
  );
}
