import { Phone, ShieldAlert } from 'lucide-react';

// Disclaimer discreto, sempre visível no rodapé
export function MedicalFooter() {
  return (
    <footer className="mt-10 px-5 pb-8 pt-6 text-center text-xs text-muted-foreground">
      <div className="mx-auto max-w-md soft-card-sm bg-card/70 px-4 py-3">
        <p className="flex items-center justify-center gap-2 font-semibold text-foreground/70">
          <ShieldAlert size={14} /> Este app não substitui consulta médica.
        </p>
        <p className="mt-1">
          Em emergência ligue{' '}
          <a href="tel:192" className="inline-flex items-center gap-1 font-bold text-danger">
            <Phone size={12} /> SAMU 192
          </a>
          . Procure sua UBS sempre que possível.
        </p>
      </div>
    </footer>
  );
}
