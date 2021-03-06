import { createRouter } from 'calamars';
import commandRoutes from './routes/commands';
import interactionRoutes from './routes/interactions';
import faqRoutes from './routes/faq';
import tripRoutes from './routes/trips';
import insultRoutes from './routes/insult';

const routes = [
    ...faqRoutes,
    ...tripRoutes,
    ...commandRoutes,
    ...interactionRoutes,
    ...insultRoutes
];

const router = createRouter(routes);
export default router;
