/**
 * Check if a user email matches the admin email.
 */
export function isAdmin(email) {
    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail) return false
    return email.toLowerCase() === adminEmail.toLowerCase()
}
