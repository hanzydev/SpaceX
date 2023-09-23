export default defineNuxtRouteMiddleware(async (to) => {
    const json = await useAPI(`/shortened-urls/${to.params.id}`, {
        headers: useRequestHeaders(['x-forwarded-for']),
        query: {
            log: true,
        },
        auth: true,
    });

    if (json?.error) {
        return abortNavigation();
    }

    return navigateTo(json.url, { external: true });
});
