import Image from 'next/image'

export default function Partners() {
  const partners = [
    "Unreal Engine",
    "Metamask",
    "Binance",
    "Oculus"
  ]

  return (
    <section className="py-20 border-t border-zinc-800">
      <div className="flex justify-between items-center gap-8 opacity-50">
        {partners.map((partner) => (
          <div key={partner} className="grayscale hover:grayscale-0 transition-all">
            <Image
              src="/placeholder.svg?height=40&width=120"
              alt={partner}
              width={120}
              height={40}
              className="object-contain"
            />
          </div>
        ))}
      </div>
    </section>
  )
}

