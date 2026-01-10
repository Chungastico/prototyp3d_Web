export default function StructuredData() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Prototyp3D',
    image: 'https://www.prototyp3dsv.com/images/HeroBambu.png', // Fallback/Main image
    '@id': 'https://www.prototyp3dsv.com',
    url: 'https://www.prototyp3dsv.com',
    telephone: '+503 7093-3901',
    email: 'prototyp3d.sv@gmail.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Santa Tecla',
      addressRegion: 'La Libertad',
      addressCountry: 'SV',
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'Santa Tecla',
      },
      {
        '@type': 'City',
        name: 'San Salvador',
      },
      {
        '@type': 'City',
        name: 'Soyapango',
      },
      {
        '@type': 'Place',
        name: 'Zona Rosa',
      },
      {
        '@type': 'Country',
        name: 'El Salvador',
      }
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
        ],
        opens: '08:00',
        closes: '17:00',
      },
    ],
    sameAs: [
      'https://www.instagram.com/prototyp3d.sv',
    ],
    priceRange: '$$',
    description: 'Servicios de impresión 3D FDM y resina, diseño y prototipado en El Salvador. Atendemos estudiantes, emprendedores y empresas.',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
