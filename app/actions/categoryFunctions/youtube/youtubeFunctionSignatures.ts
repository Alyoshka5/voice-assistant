const addVideoToPlaylistSignature = {
    type: "function" as const,
    name: "addVideoToPlaylist",
    description: "Adds a video to a specified YouTube playlist.",
    parameters: {
        type: "object",
        properties: {
            youtubeLink: {
                type: "string",
                description: "Default youtube link is '' if no link found in conversation"
            },
            playlistName: {
                type: "string",
                description: "Default playlist name is '' if no playlist found in conversation"
            }
        },
        required: ["youtubeLink", "playlistName"],
        additionalProperties: false
    },
    strict: true,
}

const functionSignatures = [
    addVideoToPlaylistSignature
]

export default functionSignatures;