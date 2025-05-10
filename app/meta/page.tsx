import MetaNavbar from "@/components/MetaNavbar"
import Footer from "@/components/Footer"

export const metadata = {
  title: "Meta | Carter Tran",
  description: "This page includes stats about the code of the website."
}

export default function MetaPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <MetaNavbar />
      <div className="container mx-auto px-4 py-16 pt-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Meta</h1>
          <p className="text-xl text-muted-foreground mb-8">
            This page includes stats about the code of the website.
          </p>
          
        </div>
      </div>
      <Footer />
    </main>
  )
} 