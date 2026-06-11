/** @param {number} total @param {number} limit */
export function getTotalPages(total, limit) {
    return Math.max(1, Math.ceil(total / limit));
}
