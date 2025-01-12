import Image from 'next/image'
import { Doto, Signika } from 'next/font/google'
const doto = Doto({  subsets: ['latin'],  weight: ['600'],  style: ['normal']})
const signika = Signika({  subsets: ['latin'],  weight: ['400'],  style: ['normal']})
export default function Stats() {
  const socialLinks = [
    {
      icon: "/icons/linkedin.png",
      url: "https://www.linkedin.com/in/pranshuaf",
      alt: "LinkedIn"
    },
    {
      icon: "/icons/github.png",
      url: "https://github.com/pranshu0604",
      alt: "GitHub"
    },
    {
      icon: "/icons/x.png",
      url: "https://x.com/notoriouspran",
      alt: "X (Twitter)"
    },
    {
      icon: "/icons/instagram.png",
      url: "https://instagram.com/pranshuaf",
      alt: "Instagram"
    },
    {
      icon: "/icons/music.png",
      url: "https://music.apple.com/profile/pranshuaf",
      alt: "Music"
    },
  ]

  return (
    <section className="py-20">
      <div className="bg-zinc-800/30 backdrop-blur-xl rounded-3xl p-8 flex lg:justify-evenly max-lg:flex-col items-center">
        <div className="flex-col gap-16">
          <div className={`text-5xl font-bold mb-2 ${doto.className}`}>Let's Connect</div>
          <div className={`text-zinc-200 text-lg ${signika.className}`}>
          Although I ghost these platforms as often as I show up...
          </div>
        </div>
        <div className="flex flex-col items-end gap-4 max-lg:mt-4">
          <div className="flex -space-x-3">
            {socialLinks.map((social, index) => (
              <a key={index} href={social.url} target="_blank" rel="noopener noreferrer">
                <Image
                  src={social.icon}
                  alt={social.alt}
                  width={60}
                  height={60}
                  className="rounded-full border-2 border-black hover:scale-110 transition-transform"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

