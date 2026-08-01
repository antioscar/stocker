/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        papel: '#F8FAFC',
        card: '#FFFFFF',
        papelAlto: '#FAFBFD',
        pauta: '#E3E7EE',
        pautaOscura: '#C9D2DC',
        tinta: '#1F2937',
        tintaSuave: '#5B6573',
        tintaTenue: '#8D97A5',
        grafito: '#1B2430',
        grafitoOscuro: '#121A24',
        oferta: '#D64040',
        ofertaOscuro: '#B73131',
        hoja: '#198754',
        hojaOscuro: '#116A3F',
        sello: '#D97706',
      },
      fontFamily: {
        ui: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        display: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        ledger: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        xxs: '10px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.05), 0 1px 3px rgba(16,24,40,0.08)',
        lift: '0 4px 12px rgba(16,24,40,0.10), 0 12px 32px rgba(16,24,40,0.16)',
      },
      borderRadius: {
        ficha: '0.5rem',
      },
      letterSpacing: {
        sello: '0.08em',
      },
    },
  },
  plugins: [],
};
