import Image from 'next/image'
import { Signika, Squada_One } from 'next/font/google'

const squadaone = Squada_One({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal']
})

const signika = Signika({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal']
})

export default function TopArtists() {
  const artists = [
    {
      name: "BlogBreeze",
      date: "React, TS, Hono, TailwindCSS, PostgreSQL",
      profile: "/projects/icons/blogbreeze.png",
      artwork: "/projects/screenshots/BlogBreeze.png",
      url: "https://blogbreeze-omega.vercel.app" // Add your URL here
    },
    {
      name: "JobJolt",
      date: "MERN, TailwindCSS",
      profile: "/projects/icons/jobjolt.png",
      artwork: "/projects/screenshots/JobJolt.png",
      url: "https://job-jolt-six.vercel.app" // Add your URL here
    }
  ]

  return (
    <section className="py-24">
      <div className={`flex flex-col md:flex-row justify-between items-start gap-16 ${signika.className}`}>
        <div className="md:w-1/3">
          <div className="text-green-400 text-lg font-semibold mb-4">Projects</div>
          <h2 className={`text-5xl font-bold mb-6 ${squadaone.className}`}>Stuff I've built</h2>
          <p className="text-zinc-400 text-lg">
            Come back soon to see a card or two more.
          </p>
        </div>
        <div className="md:w-2/3">
          <div className="grid md:grid-cols-2 gap-8">
            {artists.map((artist) => (
              <a 
                href={artist.url} 
                key={artist.name} 
                className="block bg-zinc-800/30 backdrop-blur-xl rounded-3xl p-8 transition-transform hover:scale-105"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex items-center gap-4 mb-8">
                  <Image
                    src={artist.profile}
                    alt={artist.name}
                    width={96}
                    height={96}
                    className="rounded-full"
                  />
                  <div>
                    <h3 className="text-xl font-semibold">{artist.name}</h3>
                    <p className="text-zinc-400">{artist.date}</p>
                  </div>
                </div>
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden">
                  <Image
                    src={artist.artwork}
                    alt={`${artist.name}'s artwork`}
                    fill
                    className="object-cover"
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
