export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white" aria-busy="true">
      <div className="navigation-progress" role="progressbar" aria-label="Loading page" aria-valuetext="Loading page">
        <div className="navigation-progress-bar" />
      </div>
      <div className="navigation-logo-pulse">
        <img src="/logo.jpg" alt="Loading" className="navigation-logo" />
      </div>
    </div>
  );
}
