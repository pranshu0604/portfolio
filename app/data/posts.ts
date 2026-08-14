/**
 * Writing. Content is stored as blocks rather than MDX so the whole site stays
 * a zero-dependency static build.
 *
 * NOTE: these are drafts to be edited in Pranshu's own voice before publishing —
 * they are grounded in real work, but the prose is a starting point.
 */

export type Block =
  | { t: 'p'; c: string }
  | { t: 'h'; c: string }
  | { t: 'ul'; c: string[] }
  | { t: 'code'; lang: string; c: string }
  | { t: 'quote'; c: string }

export type Post = {
  slug: string
  title: string
  dek: string
  date: string
  tag: string
  body: Block[]
}

export const POSTS: Post[] = [
  {
    slug: 'the-spinner-was-lying',
    title: 'The spinner was lying',
    dek: 'Eight seconds of "loading" for work that nobody was actually waiting on.',
    date: '2026-06-12',
    tag: 'Systems',
    body: [
      { t: 'p', c: 'A spinner is a promise. It says: something is happening, it is happening for you, and it will be over soon. Ours span for eight seconds and only one of those three things was true.' },
      { t: 'p', c: 'The endpoint did real work — that part was honest. What it got wrong was who the work was for. Almost none of it was needed to answer the request. It was needed eventually, by a report someone would open tomorrow. We were making a person hold still for a job that had no interest in them.' },
      { t: 'h', c: 'Optimising was the wrong reflex' },
      { t: 'p', c: 'My first instinct was to profile it. Find the slow query, add the index, cache the expensive call. Good instincts, completely misapplied — there was no dumb mistake buried in there. The work genuinely took eight seconds, and shaving it to six would have changed nothing about the experience except the exact duration of the lie.' },
      { t: 'p', c: 'Two questions were being treated as one:' },
      { t: 'ul', c: [
        'How long does this work take?',
        'How long does a human have to sit there?',
      ] },
      { t: 'p', c: 'The first is a property of the work. The second is a property of your architecture. You can take the second to nearly zero without touching the first, and that is almost always the cheaper move.' },
      { t: 'h', c: 'Hand back a receipt, not a result' },
      { t: 'p', c: 'The rewrite was boring, which is the point. The endpoint stopped doing the work. It validated the input, wrote a job, handed back an identifier, and got out of the way. Workers picked the job up, spread the independent parts across themselves, coordinated through Redis, and wrote the result where the client could come find it.' },
      { t: 'code', lang: 'python', c: `@router.post("/reports")\nasync def create_report(payload: ReportIn) -> ReportRef:\n    report = await reports.create(payload, status="queued")\n    await queue.enqueue("build_report", report.id)\n    return ReportRef(id=report.id, status="queued")` },
      { t: 'p', c: 'The total work did not get faster. It got wider — the parts that never depended on each other stopped pretending they did — and, more importantly, it stopped happening in front of an audience.' },
      { t: 'h', c: 'What it costs' },
      { t: 'p', c: 'Worth being honest about the bill. You now run a queue, supervise workers, and own a job whose failure nobody is synchronously waiting to hear about. You need somewhere to put the result and a way for the client to learn it arrived. You have traded one simple slow thing for one fast complicated thing.' },
      { t: 'p', c: 'Above a few seconds that trade is nearly always worth it. Below a few hundred milliseconds it nearly never is. Knowing which side of that line you are on is the actual engineering.' },
      { t: 'quote', c: 'Latency is not how long the work takes. It is how long you ask someone to believe you.' },
    ],
  },
  {
    slug: 'five-decisions-in-a-trench-coat',
    title: 'Five decisions in a trench coat',
    dek: 'Everyone calls it "retrieval", as if it were one thing you could get right once.',
    date: '2026-05-02',
    tag: 'AI',
    body: [
      { t: 'p', c: 'Every RAG system starts the same afternoon. Chunk the documents, embed them, stuff the top-k into the prompt, demo it. It works beautifully, because you asked it the questions you were thinking about while you built it.' },
      { t: 'p', c: 'Then a real user asks something your chunking strategy has no answer for, quality falls off a cliff, and you discover there is nothing to debug. It is one function. There is no seam to look inside.' },
      { t: 'p', c: 'The fix is not a better embedding model. It is noticing that "retrieval" was never one decision — it was five, standing on each other\'s shoulders under a long coat.' },
      { t: 'h', c: 'Unbutton the coat' },
      { t: 'ul', c: [
        'Route — does this question need retrieval at all? Plenty do not.',
        'Rewrite — turn a conversational question into something a retriever can actually match.',
        'Retrieve — possibly several ways at once: dense, sparse, plain structured lookup.',
        'Rerank — cheap and broad first, expensive and precise second.',
        'Synthesise — answer, with permission to say the context does not contain it.',
      ] },
      { t: 'p', c: 'Separated, each one is independently testable, independently swappable, and — the part that actually saves you — independently blameable.' },
      { t: 'h', c: 'The cheapest win is not retrieving' },
      { t: 'p', c: 'A surprising share of production queries need no retrieval whatsoever. "Summarise what we just discussed" does not want a vector search, and running one actively hurts: you inject four loosely-related chunks and the model, being agreeable, works them into the answer. A small classifier at the front deletes an entire category of confident wrong answers.' },
      { t: 'code', lang: 'python', c: `async def answer(q: Query) -> Answer:\n    route = await router.classify(q)          # direct | retrieve | tool\n    if route is Route.DIRECT:\n        return await synthesise(q, context=[])\n\n    rewritten = await rewriter.run(q)\n    hits = await gather(\n        dense.search(rewritten),\n        sparse.search(rewritten),\n    )\n    top = await reranker.rank(rewritten, dedupe(hits))[:8]\n    return await synthesise(q, context=top)` },
      { t: 'h', c: 'Embeddings are bad at names' },
      { t: 'p', c: 'Dense retrieval understands meaning and is unreliable with exact tokens — error codes, SKUs, surnames. Sparse retrieval is the exact opposite. Running both and merging costs you one extra query and removes a whole genre of embarrassing miss. Best value-per-line change available in most RAG systems.' },
      { t: 'h', c: 'Measure the parts, not the vibe' },
      { t: 'p', c: 'A monolith can only be evaluated end to end, which tells you something got worse and nothing about what. With the stages apart you can watch retrieval recall separately from answer quality — so when things degrade you know whether the retriever stopped finding the document or the model stopped using it. Those look identical from outside and have nothing in common as problems.' },
      { t: 'quote', c: 'If you cannot name the stage that regressed, you do not have a pipeline. You have a mood.' },
    ],
  },
  {
    slug: 'nobody-owns-the-middle',
    title: 'Nobody owns the middle',
    dek: 'The queue between two services is not plumbing. It is the only contract they share.',
    date: '2026-04-08',
    tag: 'Architecture',
    body: [
      { t: 'p', c: 'Producer–consumer gets taught as a concurrency primitive and then quietly promoted to an architecture, and something important goes missing in the paperwork. As a primitive it is a buffer between two threads. As an architecture it is an admission that the thing making work and the thing doing work are different systems with different owners, different failure modes, and no business being deployed together.' },
      { t: 'h', c: 'They scale on unrelated axes' },
      { t: 'p', c: 'Producers scale with traffic — more users, more events. Consumers scale with the cost of the work. Those numbers have nothing to do with each other. An API taking a thousand uploads a minute might need two workers or two hundred depending entirely on what "process an upload" means this quarter.' },
      { t: 'p', c: 'Couple them and every change to the cost of the work becomes a change to the shape of your API tier. Decouple them and it becomes a number you edit.' },
      { t: 'h', c: 'They fail differently, and that is the whole point' },
      { t: 'ul', c: [
        'A producer failing loses the event — unless accepting it was durable.',
        'A consumer failing loses nothing, if the queue holds and the job is idempotent.',
        'The queue failing loses everything, which is why it is the part you do not write yourself.',
      ] },
      { t: 'p', c: 'That middle line is the entire reason anyone does this. A crashed consumer becomes a delay instead of a data-loss incident. But it only holds if the job is idempotent, because at-least-once delivery means your worker will see the same job twice eventually. Every broker documents this. Every team is surprised by it exactly once.' },
      { t: 'code', lang: 'python', c: `async def handle(job: Job) -> None:\n    # at-least-once delivery: this will be re-run. make that boring.\n    if await results.exists(job.idempotency_key):\n        return\n\n    result = await do_work(job.payload)\n    await results.put(job.idempotency_key, result)` },
      { t: 'h', c: 'The message is an API' },
      { t: 'p', c: 'The best thing about putting a queue between two components is not the buffering — it is that the message becomes the contract. Once the producer writes a job and walks away, the only thing binding the two sides is a schema. Either half can be rewritten, relocated or rescaled without the other noticing.' },
      { t: 'p', c: 'So treat the message like an API. Version it. Keep internal object graphs out of it. The moment a consumer needs to know which framework wrote the job, your decoupling was decorative.' },
      { t: 'quote', c: 'A queue does not make a system asynchronous. It makes two halves independently deployable, which is worth considerably more.' },
    ],
  },
  {
    slug: 'the-queue-that-ate-its-worker',
    title: 'The queue that ate its worker',
    dek: 'An unbounded queue is not resilience. It is an outage with excellent manners.',
    date: '2026-03-15',
    tag: 'Systems',
    body: [
      { t: 'p', c: 'The pitch for an unbounded queue is irresistible: nothing is ever rejected. Traffic spikes, the queue absorbs it, the workers catch up later, nobody sees an error. It feels like resilience. Mostly it is a machine for converting a fast visible failure into a slow invisible one.' },
      { t: 'h', c: 'What actually happens' },
      { t: 'p', c: 'When arrival rate passes service rate, depth grows without limit and so does latency. Nothing errors. Every request is accepted, every job is eventually processed, and every user quietly experiences a system that looks fine while handing back answers that are twenty minutes stale. Your dashboards are green. Your error rate is zero. Your product is broken.' },
      { t: 'p', c: 'Then the queue itself becomes the resource under pressure. Memory climbs, the broker slows, and the component you added for stability turns into the thing that falls over.' },
      { t: 'h', c: 'Put a wall up and choose what hits it' },
      { t: 'p', c: 'Setting a maximum depth forces the question you have been avoiding: when you cannot keep up, what gives? There is no universal answer, but there are only about four:' },
      { t: 'ul', c: [
        'Reject new work and say so — honest, and lets the caller retry sensibly.',
        'Drop the oldest — correct when work is only valuable while fresh.',
        'Drop by priority — correct when some work genuinely matters more.',
        'Slow the producer down — correct when the producer is yours to slow.',
      ] },
      { t: 'p', c: 'All four beat the fifth option, which is to accept everything and hope. That is precisely what an unbounded queue picks for you, silently, on your behalf.' },
      { t: 'code', lang: 'python', c: `MAX_DEPTH = 10_000\n\nasync def submit(job: Job) -> None:\n    if await queue.depth() >= MAX_DEPTH:\n        # fail fast and loudly, while it is still one caller's problem\n        raise Overloaded(retry_after=30)\n    await queue.put(job)` },
      { t: 'h', c: 'Throughput is a flattering metric' },
      { t: 'p', c: 'It looks healthy right up to the moment it does not, because a saturated system still processes jobs at full speed — it is simply losing ground. Depth and oldest-message age tell the truth far earlier. If depth has trended upward for an hour you are already in an incident; nobody has paged you yet.' },
      { t: 'quote', c: 'A bounded queue tells you the truth immediately. An unbounded one tells you the same truth later, after it has become expensive.' },
    ],
  },
  {
    slug: 'an-unattended-shell-with-good-grammar',
    title: 'An unattended shell with good grammar',
    dek: 'The moment you hand an agent real tools, you have shipped something with opinions and access.',
    date: '2026-02-20',
    tag: 'AI',
    body: [
      { t: 'p', c: 'An agent that can only talk is a demo. An agent that can read your database, call internal services and run code is genuinely useful — and is also production software whose control flow is being decided, token by token, by a model. Both are true simultaneously, and the second is where nearly all the engineering lives.' },
      { t: 'h', c: 'Tools are an API for a very literal reader' },
      { t: 'p', c: 'A tool definition gets read by something with no context, no institutional memory, and a powerful bias toward the first plausible option. Design accordingly:' },
      { t: 'ul', c: [
        'Name by intent, not implementation. `find_customer` beats `query_users_table`.',
        'Put the constraints in the description. If a date must be ISO, that is where it says so.',
        'Few well-shaped tools over many overlapping ones — ambiguity gets resolved by guessing.',
        'Write errors that explain what to do differently. Something will read them and try again.',
      ] },
      { t: 'p', c: 'A protocol like MCP earns its keep here by making the tool layer a real boundary with a schema, rather than a pile of function signatures injected into a prompt. The same tools then work across clients, and you can test them without a model anywhere near the loop.' },
      { t: 'h', c: 'Now assume it will do the worst available thing' },
      { t: 'p', c: 'Given tools, an agent will eventually call the destructive one at the wrong moment. Not from malice — from a plausible-looking sequence of tokens that led there. Design as though that is certain, because across enough runs it is.' },
      { t: 'code', lang: 'python', c: `@tool(scopes={"reports:read"}, timeout=10, dry_run_supported=True)\nasync def build_report(ctx: Ctx, spec: ReportSpec) -> Report:\n    # the tool cannot widen its own permissions; ctx is issued per-session\n    return await reports.build(spec, actor=ctx.actor)` },
      { t: 'p', c: 'The controls that matter are unglamorous: per-session scopes instead of ambient credentials, timeouts on everything, allow-lists for network egress, and a hard wall between tools that read and tools that write. Anything irreversible gets a confirmation owned by a human, not by the model.' },
      { t: 'h', c: 'Sandboxes are for the code path' },
      { t: 'p', c: 'The moment an agent can execute user-defined workflows you are running untrusted code, and it deserves exactly the treatment untrusted code has always deserved: isolated runtime, no ambient filesystem, no implicit credentials, explicit resource limits. This is a solved problem everywhere else. The novelty of AI does not buy an exemption.' },
      { t: 'quote', c: 'Capability without a boundary is not an agent. It is a shell with nobody watching and unusually good grammar.' },
    ],
  },
]

export function getPost(slug: string) {
  return POSTS.find((p) => p.slug === slug)
}

export function readingTime(p: Post) {
  const words = p.body.reduce((n, b) => {
    if (b.t === 'ul') return n + b.c.join(' ').split(/\s+/).length
    return n + String(b.c).split(/\s+/).length
  }, 0)
  return Math.max(1, Math.round(words / 200))
}
