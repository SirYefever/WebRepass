class Router {
    private routes = new Map<string, (() => void) | string>();
    private templates = new Map<string, (() => void)>();

    constructor() {
        this.retrieveRoute = this.retrieveRoute.bind(this);
    }

    public route(path: string, templateName: string): (() => void) | string | null {
        if (typeof templateName === 'string') {
            this.routes.set(path, this.templates.get(templateName)!);
            return this.routes.get(path)!;
        } else {
            return null;
        }
    };

    public template(name: string, templateFunction: () => void): () => void {
        this.templates.set(name, templateFunction)
        return templateFunction;
    };

    public resolveRoute(route: string) {
        try {
            return this.routes.get(route);
        } catch (e) {
            throw new Error(`Route ${route} not found`);
        };
    };

    public retrieveRoute() {
        let url = window.location.pathname || '/';
        let route: () => void;
        if (url.includes("groups/")){
            route = this.resolveRoute("/groups/") as (() => void);
        } else if (url.includes("courses/")){
            if (url.includes("my")){
                route = this.resolveRoute("/courses/my") as (() => void);
            } else if (url.includes("teaching")){
                route = this.resolveRoute("/courses/teaching") as (() => void);
            } else{
                route = this.resolveRoute("/courses/") as (() => void);
            }
        } else {
            route = this.resolveRoute(url) as (() => void);
        }
        if (route === undefined) {
            url = "/error";
            route = this.resolveRoute(url) as (() => void);
        }

        if (typeof route === 'function') {
            route();
        }
    };

}

export {Router}