import Header from "@/components/Header"
import Timeline from "@/components/Timeline"
import Avatar from "@/components/Avatar"
import Projects from "@/components/Projects"
import Footer from "@/components/Footer"
import ContactForm from "@/components/ContactForm"
import Navbar from "@/components/Navbar"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <section id="header" className="min-h-screen flex items-center justify-center">
          <Header />
        </section>

        <section id="experience" className="py-16 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <Timeline />
            </div>
            <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-[20vh] lg:h-[min(100%,400px)]">
              <Avatar />
            </div>
          </div>
        </section>

        <section id="projects" className="py-16">
          <h2 className="text-3xl font-bold mb-8">Projects</h2>
          <Projects />
        </section>

        <section id="contact" className="py-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Get in Touch</h2>
            <p className="text-muted-foreground mt-2">Have a question or want to work together? Send me a message!</p>
          </div>
          <ContactForm />
        </section>

        <section id="footer" className="py-16">
          <Footer />
        </section>
      </div>
    </main>
  )
}
