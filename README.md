# البرق السريع (React + TypeScript + Tailwind)

مشروع Front-End مطابق للتصميم المرفق (RTL) باستخدام:
- React (Hooks)
- TypeScript
- TailwindCSS
- Redux Toolkit (Actions/Thunks)
- Mock API + Front-End Logic

## الألوان والخط
- الخلفية العامة للشاشات: `#F9FAFB`
- خلفية العناصر: `#FFFFFF`
- اللون الأساسي: `#FF6B2C`
- اللون الكحلي: `#03081F`
- الخط: Tajawal

تم ضبط ذلك في `tailwind.config.cjs` و `index.html`.

## تشغيل المشروع

1) تثبيت الحزم:

```bash
npm install
```

2) تشغيل وضع التطوير:

```bash
npm run dev
```

3) بناء المشروع:

```bash
npm run build
```

## الصفحات
- `/` الرئيسية
- `/restaurants` صفحة جميع المطاعم + فلاتر + تصنيفات
- `/login` تسجيل الدخول
- `/register` إنشاء حساب
- `/about` من نحن

## ملاحظات
- تم استخدام Mock API داخل `src/api/mockApi.ts` (مع Delay بسيط لمحاكاة الشبكة).
- الـ Redux Thunks موجودة في `src/store/thunks/*`.
- الـ UI Components في `src/components/ui/*`.
