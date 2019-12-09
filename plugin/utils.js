module.exports = {
    responseTimeOut({time = 4500, resp = ''}, ...event) {
        return Promise.race([
            new Promise((resolve) => {
                setTimeout(resolve, time, resp);
            }),
            ...event,
        ])
    },
};