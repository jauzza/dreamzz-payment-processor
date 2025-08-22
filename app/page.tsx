import { Background } from "@/components/background"
import { Footer } from "@/components/footer"
import { Newsletter } from "@/components/newsletter"

export default function Home() {
  return (
    <main className="h-screen w-full">
      <div className="relative h-full w-full">
        <Background src="/snaptik_1948601182043471984-0.jpeg" />
        <Newsletter />
        <Footer />
      </div>
    </main>
  )
}
