type Section = { heading: string; body: string };

export function ContentPage({ title, intro, sections }: { title: string; intro: string; sections: Section[] }) {
  return (
    <article className="mx-auto max-w-3xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{title}</h1>
      <p className="mt-3 text-muted-foreground">{intro}</p>
      <div className="mt-8 space-y-6 rounded-(--store-radius) bg-card p-6 sm:p-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-semibold">{section.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
