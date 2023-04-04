export const formatDate = function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("fr-FR")
        + " "
        + date.toLocaleTimeString("fr-FR")
    ;
}

export default formatDate;