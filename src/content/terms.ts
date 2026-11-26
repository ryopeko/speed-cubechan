import type { Lang } from "@/i18n/messages";

/*
 * The Terms of Service (/terms/). The Japanese text is the binding one; the
 * English text is a translation. When changing a section, change both and
 * update TERMS_UPDATED.
 */

export type TermsSection = { heading: string; paragraphs: readonly string[] };

export type Terms = {
  intro: string;
  sections: readonly TermsSection[];
  /** Shown under the sections, with the date filled in. */
  updated: string;
};

/** When the terms took effect or were last changed (YYYY-MM-DD). */
export const TERMS_UPDATED = "2026-11-26";

const ja: Terms = {
  intro:
    "この利用規約(以下「本規約」)は、ryopeko(以下「運営者」)が提供する「スピードキュービちゃん」(https://speed-cubechan.com/、以下「本サービス」)の利用条件を定めるものです。本サービスを利用した方は、本規約に同意したものとみなします。",
  sections: [
    {
      heading: "第1条(本サービスの内容)",
      paragraphs: [
        "本サービスは、ルービックキューブの OLL・PLL の手順を表示し、練習を助ける無料のウェブサービスです。登録やログインは不要です。",
      ],
    },
    {
      heading: "第2条(データの保存)",
      paragraphs: [
        "本サービスは、覚えた状態・表示の設定・言語などの情報を、利用者のブラウザの Cookie および localStorage に保存します。",
        "これらの情報は、ブラウザの設定から削除できます。削除した情報は元に戻せません。",
      ],
    },
    {
      heading: "第3条(禁止事項)",
      paragraphs: [
        "利用者は、本サービスの利用にあたり、法令または公序良俗に反する行為、本サービスの運営を妨げる行為(過度な負荷をかける行為を含みます)、その他運営者が不適切と判断する行為をしてはなりません。",
      ],
    },
    {
      heading: "第4条(知的財産権)",
      paragraphs: [
        "本サービスに含まれるキャラクター(キュービちゃん)の画像その他のコンテンツの権利は、運営者または正当な権利者に帰属します。法令で認められる範囲を超えて、無断で複製・転載・改変することはできません。",
      ],
    },
    {
      heading: "第5条(保証の否認と免責)",
      paragraphs: [
        "運営者は、本サービスの内容(手順の正確さを含みます)について、正確性・完全性・有用性その他いかなる保証もしません。",
        "運営者は、本サービスの利用、または利用できなかったことによって利用者に生じた損害について、運営者の故意または重大な過失による場合を除き、責任を負いません。",
      ],
    },
    {
      heading: "第6条(本サービスの変更・停止)",
      paragraphs: [
        "運営者は、利用者に事前に通知することなく、本サービスの内容を変更し、または提供を停止・終了することがあります。",
      ],
    },
    {
      heading: "第7条(本規約の変更)",
      paragraphs: [
        "運営者は、必要と判断したときに本規約を変更できます。変更後の本規約は、本サービス上に掲示した時点から効力を生じます。",
      ],
    },
    {
      heading: "第8条(準拠法・裁判管轄・言語)",
      paragraphs: [
        "本規約は日本法に準拠し、日本法に従って解釈されます。",
        "本サービスに関して紛争が生じた場合は、運営者の住所地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。",
        "本規約は日本語版を正本とします。英語版は参考のための翻訳であり、内容に違いがある場合は日本語版が優先します。",
      ],
    },
  ],
  updated: "制定日: {date}",
};

const en: Terms = {
  intro:
    "These Terms of Service (the \"Terms\") set out the conditions for using Speed Cube-chan (https://speed-cubechan.com/, the \"Service\"), provided by ryopeko (the \"Operator\"). By using the Service, you are deemed to have agreed to these Terms.",
  sections: [
    {
      heading: "1. The Service",
      paragraphs: [
        "The Service is a free website that shows the algorithms for the Rubik's Cube OLL and PLL cases and helps you practice them. No sign-up or login is required.",
      ],
    },
    {
      heading: "2. Data storage",
      paragraphs: [
        "The Service stores information such as your learning statuses, display settings, and language in your browser's cookies and localStorage.",
        "You can delete this information in your browser's settings. Deleted information cannot be restored.",
      ],
    },
    {
      heading: "3. Prohibited conduct",
      paragraphs: [
        "When using the Service, you must not break any law or act against public order and morals, interfere with the operation of the Service (including by putting excessive load on it), or do anything else the Operator considers inappropriate.",
      ],
    },
    {
      heading: "4. Intellectual property",
      paragraphs: [
        "The rights to the character (Cube-chan) images and other content in the Service belong to the Operator or their rightful holders. You may not copy, republish, or modify them beyond what the law allows without permission.",
      ],
    },
    {
      heading: "5. Disclaimer of warranties and liability",
      paragraphs: [
        "The Operator makes no warranty of any kind about the Service, including the accuracy, completeness, or usefulness of its content (including the algorithms).",
        "Except in cases of the Operator's willful misconduct or gross negligence, the Operator is not liable for any damage arising from your use of, or inability to use, the Service.",
      ],
    },
    {
      heading: "6. Changes to and suspension of the Service",
      paragraphs: [
        "The Operator may change the Service, or suspend or end it, without notice.",
      ],
    },
    {
      heading: "7. Changes to these Terms",
      paragraphs: [
        "The Operator may change these Terms when it considers it necessary. The changed Terms take effect when they are posted on the Service.",
      ],
    },
    {
      heading: "8. Governing law, jurisdiction, and language",
      paragraphs: [
        "These Terms are governed by and interpreted under the laws of Japan.",
        "Any dispute about the Service is subject to the exclusive jurisdiction, in the first instance, of the court with jurisdiction over the Operator's place of residence.",
        "The Japanese version of these Terms is the original. This English version is a translation for reference; if they differ, the Japanese version prevails.",
      ],
    },
  ],
  updated: "Effective: {date}",
};

export const TERMS: Record<Lang, Terms> = { ja, en };
