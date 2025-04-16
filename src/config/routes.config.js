export const API_PREFIX = '/api';

export const ROUTES = {
    AUTH: `${API_PREFIX}/auth`,
    ADMIN: `${API_PREFIX}/admin`,
    USERS: `${API_PREFIX}/users`,
    QUESTIONS: `${API_PREFIX}/questions`
};

export const routeConfig = (app) => {
    return {
        auth: (router) => app.use(ROUTES.AUTH, router),
        admin: (router) => app.use(ROUTES.ADMIN, router),
        users: (router) => app.use(ROUTES.USERS, router),
        questions: (router) => app.use(ROUTES.QUESTIONS, router),
        docs: (router) => app.use('/api-docs', router)
    };
};
