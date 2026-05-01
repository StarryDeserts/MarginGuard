import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'

export function LandingNav() {
  const navigate = useNavigate()

  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 md:px-6">
      <Link to="/" className="flex items-center gap-3 text-text-primary">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-sui-cyan/60 bg-sui-cyan/10 text-sui-cyan">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <span className="text-2xl font-semibold">
          Margin<span className="text-sui-cyan">Guard</span>
        </span>
      </Link>
      <nav className="hidden items-center gap-8 text-sm font-medium text-text-secondary lg:flex">
        <a href="#product" className="hover:text-text-primary">Product</a>
        <a href="#how" className="hover:text-text-primary">How It Works</a>
        <button type="button" className="cursor-pointer hover:text-text-primary" onClick={() => navigate('/demo')}>Demo</button>
        <a href="#architecture" className="hover:text-text-primary">Architecture</a>
      </nav>
      <div className="flex items-center gap-3">
        <Button variant="secondary" className="hidden sm:inline-flex" onClick={() => navigate('/demo')}>
          View Demo
        </Button>
        <Button onClick={() => navigate('/dashboard')} icon={<ArrowRight className="h-4 w-4" />}>
          Launch App
        </Button>
      </div>
    </header>
  )
}
