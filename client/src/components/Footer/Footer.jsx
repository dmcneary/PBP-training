const Footer = () => (
  <footer className="mt-20 border-t border-white/10 bg-slate-950/70">
    <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-10 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-slate-300">Fit Monkeys</p>
        <p>Bootcamp project, rebuilt for 2026.</p>
      </div>
      <div className="flex items-center gap-4">
        <a
          className="text-slate-300 hover:text-white"
          href="https://github.com/dmcneary/final-project"
        >
          GitHub
        </a>
        <span className="text-slate-600">© 2026</span>
      </div>
    </div>
  </footer>
);

export default Footer;
