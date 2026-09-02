/**
 * First person, and deliberately plain.
 *
 * Every concrete claim here maps to a row in TRUTH-LEDGER.md. Nothing implies
 * industry experience, certifications or team roles, none of which are on this
 * site.
 */
export function About() {
  const paragraphs = [
    "I'm studying artificial intelligence and machine learning at CMR University in Bengaluru. Most of what I actually know came from building something, breaking it, and working out why.",
    "My work splits roughly in two. On the machine learning side I've worked through regression, classification and evaluation on public datasets, and the more useful lesson there was that how you set up an evaluation matters more than the number it produces — a stroke dataset where one case in twenty is positive will happily hand you 95% accuracy for a model that predicts nothing.",
    "On the systems side I've been building a retrieval-augmented chatbot end to end: text extraction, chunking, embeddings, vector search in Postgres, reranking, and a provider layer so the same pipeline runs against a local model or a hosted one. That one has taught me the most, mostly through the parts that didn't work the first time.",
    "What interests me is applied NLP and retrieval — the problem of getting the right context in front of a model, rather than the model itself. I'm looking for an internship or an entry-level role where I can keep working on that.",
  ];

  // The first paragraph is set larger and in the page's primary text colour.
  // An About section that opens at the same weight as its own footnotes reads
  // as a wall; giving the opening line a lead makes the section scannable in
  // one glance and rewards the reader who continues.
  const [opening, ...rest] = paragraphs;

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <p className="t-lead max-w-[24ch] text-text lg:col-span-5">{opening}</p>
      <div className="flex flex-col gap-5 lg:col-span-6 lg:col-start-7">
        {rest.map((paragraph) => (
          <p
            key={paragraph.slice(0, 32)}
            className="t-body max-w-[62ch] text-text-secondary"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
