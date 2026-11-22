import { EventInfoBanner } from './components/EventInfoBanner'
import { RegistrationWizard } from './components/RegistrationWizard'

function App() {
  return (
    <div className="mx-auto min-h-svh max-w-6xl px-4 py-8 sm:px-6 lg:py-14">
      <header className="max-w-3xl">
        <div className="flex items-center gap-4 sm:gap-6">
          <img
            src="/logo.png"
            alt=""
            width={320}
            height={311}
            className="size-16 shrink-0 object-contain sm:size-24"
          />
          <h1 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            Registro para paseo Iglesia Acym La Florida
          </h1>
        </div>
        <p className="mt-5 max-w-2xl text-lg text-muted">
          Inscribe a tu grupo familiar, hasta 5 personas por inscripción. Al final verás el total a pagar según la
          edad de cada uno.
        </p>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:gap-16">
        <main className="lg:order-2">
          <RegistrationWizard />
        </main>
        <aside className="lg:sticky lg:top-8 lg:order-1 lg:self-start">
          <EventInfoBanner />
        </aside>
      </div>
    </div>
  )
}

export default App
