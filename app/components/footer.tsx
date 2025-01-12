export default function Footer() {
  const sections = [
    {
      title: "Explore",
      links: ["Art", "Collectibles", "Domain Name", "Utility"]
    },
    {
      title: "Statistic",
      links: ["Ranking", "Activity"]
    },
    {
      title: "Resource",
      links: ["Help Center", "Platform Status", "Partners", "Blog", "FAQ"]
    },
    {
      title: "Company",
      links: ["About Us", "Career", "Support"]
    }
  ]

  return (
    <footer className="bg-zinc-900/40 backdrop-blur-md py-6 relative">
      <div className="container mx-auto px-6 sm:px-8 md:px-16 lg:px-24 xl:px-32">
        <div className="pt-8 border-t border-zinc-800 text-center text-zinc-400 text-sm">
          Copyright © (Yep, soon)
        </div>
      </div>
    </footer>
  )
}

