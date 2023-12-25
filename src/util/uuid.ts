export const generateUUID = () => {
    const buffer = new Uint16Array(8);
    window.crypto.getRandomValues(buffer);

    const S4 = (num: number) => {
        let ret = num.toString(16);

        while (ret.length < 4) {
            ret = '0' + ret;
        }

        return ret;
    };

    return (
        S4(buffer[0]) +
        S4(buffer[1]) +
        '-' +
        S4(buffer[2]) +
        '-' +
        S4(buffer[3]) +
        '-' +
        S4(buffer[4]) +
        '-' +
        S4(buffer[5]) +
        S4(buffer[6]) +
        S4(buffer[7])
    );
};
