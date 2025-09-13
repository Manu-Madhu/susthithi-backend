const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const { generateAccessToken, generateRefreshToken } = require("../services/token.service");

const authCtrl = {};

const delayForSecurity = () => new Promise(resolve => setTimeout(resolve, 500));

authCtrl.Login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body

        const escapeRegex = str => str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        const emailCaseRegex = new RegExp(`^${escapeRegex(email)}$`, 'i');

        const user = await User.findOne({
            email: emailCaseRegex
        }).lean();

        if (!user) {
            await delayForSecurity();
            return res.status(401).json({
                msg: "Invalid credentials"
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            await delayForSecurity();
            return res.status(401).json({
                msg: "Invalid credentials"
            });
        }

        const accessToken = generateAccessToken({
            userId: user._id,
            role: user.role
        })

        const refreshToken = generateRefreshToken({
            userId: user._id,
            role: user.role
        })

        const {
            password: _,
            ...userInfo
        } = user;

        res.status(200).json({
            userInfo,
            accessToken,
            refreshToken
        })

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