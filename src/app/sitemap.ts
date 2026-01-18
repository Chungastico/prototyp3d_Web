import { MetadataRoute } from 'next';

const SITE_URL = 'https://www.prototyp3dsv.com';

const EXCLUDED_PATHS = [
    '/auth',
    '/dashboard',
    '/perfil',
];

export default function sitemap(): MetadataRoute.Sitemap {
    const routes = [
        '',
        '/impresion-3d-el-salvador',
        '/impresion-3d-estudiantes',
        '/impresion-3d-empresas',
        '/impresion-3d-emprendedores',
        '/materiales-impresion-3d',
        '/servicios',
        '/proyectos',
        '/nosotros',
        '/contacto',
        '/como-funciona-impresion-3d',
    ];

    return routes.map((route) => ({
        url: `${SITE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
    }));
}
