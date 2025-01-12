import { Button } from "@/components/ui/button"

export default function Newsletter() {
  return (
    <section className="py-20">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold">
          Subscribe to Get Fresh<br />
          News Update About<br />
          NFTs.
        </h2>
        <Button size="lg" className="bg-yellow-400 text-black hover:bg-yellow-500 mt-8">
          Subscribe
        </Button>
      </div>
    </section>
  )
}

