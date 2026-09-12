export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-ink-900 text-gray-300">
      <div className="container-page grid gap-8 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold text-white">UNIMA Gavel Club</p>
          <p className="mt-2 text-sm text-gray-400">
            A student community at the University of Malawi focused on developing communication,
            public speaking, leadership and confidence.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-400">Explore</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="/about" className="hover:text-white">About the Club</a></li>
            <li><a href="/stories" className="hover:text-white">Stories</a></li>
            <li><a href="/updates" className="hover:text-white">Updates</a></li>
            <li><a href="/join" className="hover:text-white">Join Us</a></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-400">Contact</p>
          <p className="mt-3 text-sm">University of Malawi, Zomba, Malawi</p>
          <p className="text-sm">gavelclub@unima.ac.mw</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} UNIMA Toastmasters Gavel Club. All rights reserved.
      </div>
    </footer>
  );
}
