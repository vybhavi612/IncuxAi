const axios = require("axios");

const getRepository = async (req, res) => {

    try {

        const {
            username,
            repo
        } = req.params;

        const response = await axios.get(
            `https://api.github.com/repos/${username}/${repo}`
        );

        res.status(200).json({

            repoName:
                response.data.name,

            stars:
                response.data.stargazers_count,

            forks:
                response.data.forks_count,

            lastUpdated:
                response.data.updated_at,

            lastPush:
                response.data.pushed_at,

            visibility:
                response.data.visibility

        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

module.exports = {
    getRepository
};