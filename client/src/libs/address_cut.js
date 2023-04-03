export const addressCut = function addressCut(address) {
    return address.slice(0, 5) + "..." + address.slice(39, 42);
}

export default addressCut;