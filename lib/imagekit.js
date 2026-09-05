import ImageKit from 'imagekit'

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
})

/**
 * Upload a file buffer to ImageKit.
 * @param {Buffer|string} file - File buffer or base64 string
 * @param {string} fileName - Name for the uploaded file
 * @param {string} folder - ImageKit folder path (e.g. '/listings')
 * @returns {Promise<{url: string, fileId: string}>}
 */
export async function uploadImage(file, fileName, folder = '/listings') {
    const result = await imagekit.upload({
        file,
        fileName,
        folder,
        useUniqueFileName: true,
    })
    return { url: result.url, fileId: result.fileId }
}

export default imagekit
