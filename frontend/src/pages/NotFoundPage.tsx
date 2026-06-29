import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { SleepingCat } from '../components/pixel';

export function NotFoundPage() {
  return (
    <main className="page-shell flex min-h-screen items-center justify-center px-4">
      <section className="pixel-card w-full max-w-xl text-center">
        <SleepingCat />
        <p className="pixel-kicker mt-4">404</p>
        <h1 className="pixel-title">This trail went quiet</h1>
        <p className="pixel-body mt-3">
          The page is curled up somewhere else. Head back to ScamPurr and start a fresh scan.
        </p>
        <Link to="/" className="btn-primary mt-6 inline-flex items-center justify-center gap-2 px-5 py-3">
          <Home className="h-4 w-4" />
          Home
        </Link>
      </section>
    </main>
  );
}
