export const Photographer = '0';
export const Client = '1';

export const getRole = (role) => {
    switch (role) {
        case Photographer:
            return 'Photographe';
        case Client:
            return 'Client';
        default:
            return 'Inconnu';
    }
}