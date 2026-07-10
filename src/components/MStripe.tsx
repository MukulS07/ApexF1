export function MStripe({ className = "", vertical = false }: { className?: string; vertical?: boolean }) {
  return <span className={`${vertical ? "m-stripe-vertical" : "m-stripe"} ${className}`} aria-hidden />;
}
