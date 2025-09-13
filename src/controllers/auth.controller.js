const authCtrl = {};

authCtrl.Login = async (req, res) => {
    try {
    const { error, value } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({ msg: error.details[0].message });
    }

    const { email, password } = value;

    } catch (error) {
        console.error(error)
    }
}

authCtrl.regenerateTokens = async (req, res) => {
    const refreshToken = req.body.refreshToken;

    if (typeof refreshToken !== 'string') return res.status(401).json({
        msg: "No refresh token"
    })

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(401).json({
            msg: "invalid refresh token"
        })

        const accessToken = generateAccessToken({
            userId: user._id,
            role: user.role
        });

        const refreshToken = generateRefreshToken({
            userId: user._id,
            role: user.role
        })

        res.status(200).json({
            accessToken,
            refreshToken
        });
    })
}


module.exports = authCtrl