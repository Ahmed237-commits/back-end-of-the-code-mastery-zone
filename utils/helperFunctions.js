/**
 * Format a date to relative time (e.g., "2 hours ago", "3 days ago")
 * @param {Date} date - The date to format
 * @returns {string} - Formatted relative time string
 */
const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

    if (diffInSeconds < 60) {
        return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
        return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
};

/**
 * Generate an excerpt from content
 * @param {string} content - The content to generate excerpt from
 * @param {number} maxLength - Maximum length of the excerpt (default: 150)
 * @returns {string} - Generated excerpt
 */
const generateExcerpt = (content, maxLength = 150) => {
    if (!content) return '';

    // Remove markdown/HTML tags for plain text excerpt
    const plainText = content.replace(/[#*_~`>\[\]]/g, '').trim();

    if (plainText.length <= maxLength) {
        return plainText;
    }

    // Cut at the last complete word before maxLength
    const truncated = plainText.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    return lastSpaceIndex > 0
        ? truncated.substring(0, lastSpaceIndex) + '...'
        : truncated + '...';
};

module.exports = {
    formatTimeAgo,
    generateExcerpt
};
