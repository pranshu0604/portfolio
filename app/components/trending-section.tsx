import Image from 'next/image'
import { Signika, Squada_One } from 'next/font/google'
const signika = Signika({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal']
})
const squadaone = Squada_One({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal']
})

export default function TrendingSection() {
  return (
    <section className="py-24">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-12 ${signika.className}`}>
        <div className="md:w-1/3">
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-4">
        {[
          { icon: "/tech/react.svg", name: "React" },
          { icon: "/tech/typescript.svg", name: "TypeScript" },
          { icon: "/tech/nextjs.svg", name: "Next.js" },
          { icon: "/tech/tailwind.svg", name: "Tailwind CSS" },
          { icon: "/tech/node.svg", name: "Node.js" },
          { icon: "/tech/mongodb.svg", name: "MongoDB" },
          { icon: "/tech/figma.svg", name: "Figma" },
          { icon: "/tech/prisma.svg", name: "Prisma" },
          { icon: "/tech/express.svg", name: "Express" },
          { icon: "/tech/vercel.svg", name: "Vercel" },
          { icon: "/tech/git.svg", name: "Git" },
          { icon: "/tech/framermotion.svg", name: "Framer Motion" },
          { icon: "/tech/postgres.svg", name: "Postgres" },
          { icon: "/tech/html.svg", name: "HTML5" },
          { icon: "/tech/css.svg", name: "CSS3" },
          { icon: "/tech/js.svg", name: "JS" },          
        ].map((item) => (
            <div key={item.name} className="relative w-16 h-16 rounded-full overflow-hidden bg-white/10 backdrop-blur-md border border-zinc-700/50 hover:border-zinc-500 transition-colors">
            <Image
            src={item.icon}
            alt={item.name}
            fill
            className="object-contain p-2 hover:scale-110 transition-transform"
            />
            </div>
        ))}
          </div>
        </div>
        <div className="md:w-2/3">
          <div className="text-green-400 text-lg font-semibold mb-4">Skills</div>
          <h2 className={`text-4xl lg:text-3xl font-bold mb-8 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent ${squadaone.className}`}>
            What gets me paid (and excited) ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-xl bg-zinc-800/50 backdrop-blur-md border border-zinc-700/50 hover:border-zinc-500 transition-all">
              <h3 className="text-xl font-semibold mb-3 text-green-400">Frontend</h3>
              <p className="text-zinc-300">Next.js, React, TailwindCSS, Framer Motion</p>
            </div>
            <div className="p-6 rounded-xl bg-zinc-800/50 backdrop-blur-md border border-zinc-700/50 hover:border-zinc-500 transition-all">
              <h3 className="text-xl font-semibold mb-3 text-green-400">Backend</h3>
              <p className="text-zinc-300">SQL (Postgres, MySQL), Prisma , REST APIs, Express, MongoDB, Node.js</p>
            </div>
            <div className="p-6 rounded-xl bg-zinc-800/50 backdrop-blur-md border border-zinc-700/50 hover:border-zinc-500 transition-all">
              <h3 className="text-xl font-semibold mb-3 text-green-400">Other Skills</h3>
              <p className="text-zinc-300"> TypeScript, HTML, CSS, JavaScript, Figma, Git</p>
            </div>
            <div className="p-6 rounded-xl bg-zinc-800/50 backdrop-blur-md border border-zinc-700/50 hover:border-zinc-500 transition-all">
              <h3 className="text-xl font-semibold mb-3 text-green-400">Beyond Code</h3>
              <p className="text-zinc-300">Philosophy, Psychology, Pop-Culture nerd, currently learning Spanish, and I hit the gym!</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

