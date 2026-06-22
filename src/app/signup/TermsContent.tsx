import type { Lang } from "@/lib/i18n/translations";

export function TermsContent({ lang }: { lang: Lang }) {
  if (lang === "ar") {
    return (
      <div className="prose prose-sm max-h-64 overflow-y-auto rounded-md border border-stone-200 bg-stone-50 p-4 text-right text-stone-700" dir="rtl">
        <h3 className="font-semibold text-stone-900">الشروط والأحكام</h3>

        <p><strong>١. القبول</strong><br />
        باستخدامك لمنصة TajerLink، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يُرجى عدم استخدام المنصة.</p>

        <p><strong>٢. الخدمة</strong><br />
        تتيح TajerLink للمستخدمين إنشاء متاجر إلكترونية وإدارتها. يتحمل أصحاب المتاجر المسؤولية الكاملة عن المحتوى والمنتجات والمعلومات التي يقدمونها.</p>

        <p><strong>٣. الاشتراك والدفع</strong><br />
        يستلزم إنشاء متجر دفع رسوم اشتراك لمرة واحدة. جميع المدفوعات غير قابلة للاسترداد بعد إنشاء المتجر. نحتفظ بالحق في تعديل رسوم الاشتراكات الجديدة في أي وقت.</p>

        <p><strong>٤. الاستخدام المقبول</strong><br />
        لا يجوز استخدام المنصة لأغراض غير قانونية، أو بيع منتجات محظورة، أو تقديم معلومات مضللة. يحق لنا إيقاف أي متجر يخالف هذه الشروط.</p>

        <p><strong>٥. الخصوصية</strong><br />
        نحرص على حماية بياناتك وفقاً لسياسة الخصوصية الخاصة بنا. لن يتم مشاركة معلوماتك مع أطراف ثالثة دون موافقتك إلا في الحالات التي يستلزمها القانون.</p>

        <p><strong>٦. تحديد المسؤولية</strong><br />
        لا تتحمل TajerLink المسؤولية عن أي خسائر أو أضرار تنجم عن استخدام المنصة. يُقدَّم الاستخدام على أساس "كما هو".</p>

        <p><strong>٧. التعديلات</strong><br />
        نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إشعار المستخدمين بأي تغييرات جوهرية.</p>
      </div>
    );
  }

  return (
    <div className="prose prose-sm max-h-64 overflow-y-auto rounded-md border border-stone-200 bg-stone-50 p-4 text-stone-700">
      <h3 className="font-semibold text-stone-900">Terms & Conditions</h3>

      <p><strong>1. Acceptance</strong><br />
      By using TajerLink, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the platform.</p>

      <p><strong>2. The Service</strong><br />
      TajerLink enables users to create and manage online stores. Store owners are fully responsible for the content, products, and information they provide.</p>

      <p><strong>3. Subscription & Payment</strong><br />
      Creating a store requires a one-time subscription fee. All payments are non-refundable once the store has been created. We reserve the right to adjust fees for new subscriptions at any time.</p>

      <p><strong>4. Acceptable Use</strong><br />
      You may not use the platform for unlawful purposes, sell prohibited goods, or provide misleading information. We reserve the right to suspend any store that violates these terms.</p>

      <p><strong>5. Privacy</strong><br />
      We protect your data in accordance with our Privacy Policy. Your information will not be shared with third parties without your consent except as required by law.</p>

      <p><strong>6. Limitation of Liability</strong><br />
      TajerLink is not liable for any loss or damage arising from use of the platform. The service is provided on an "as is" basis.</p>

      <p><strong>7. Amendments</strong><br />
      We reserve the right to modify these terms at any time. Users will be notified of any material changes.</p>
    </div>
  );
}
