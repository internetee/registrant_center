const validPath = (path) => {
    if (typeof path !== 'string' || !/^\/confirmation\/(?:[a-zA-Z0-9._~-]|%[a-fA-F0-9]{2})+\/(?:[a-zA-Z0-9._~-]|%[a-fA-F0-9]{2})+\/(?:[a-zA-Z0-9._~-]|%[a-fA-F0-9]{2})+$/.test(path)) return false;
    try {
        return path.split('/').slice(2).every((part) => {
            const decoded = decodeURIComponent(part);
            return decoded !== '.' && decoded !== '..' &&
                [...decoded].every((char) => !'/\\?#'.includes(char) && char.charCodeAt(0) >= 32 && char.charCodeAt(0) !== 127);
        });
    } catch {
        return false;
    }
};

export const startConfirmationLogin = (req, res) => {
    const { path } = req.body;
    if (!validPath(path)) return res.status(400).json({ error: 'Invalid return path' });
    req.session.confirmationReturnPath = path;
    delete req.session.confirmationLoginAttempted;
    delete req.session.confirmationLoginFailed;
    delete req.session.user;
    delete req.session.token;
    return res.status(200).json({});
};
