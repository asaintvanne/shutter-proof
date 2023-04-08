const { contracts_build_directory } = require("../truffle-config");

const account = process.argv[4];
const name = process.argv[5];
const siret = process.argv[6];
const role = process.argv[7];

module.exports = async function(callback) {
    await register(artifacts);
    callback();
};

const register = async (artifacts) => {
    const ShutterProof = artifacts.require('ShutterProof');
    const ShutterProofInstance = await ShutterProof.deployed();

    try {
        await ShutterProofInstance.register(name, web3.utils.fromAscii(siret), role, {from: account});
        console.log("REGISTRATION OK");
    } catch (error) {
        console.log("REGISTRATION KO");
        console.log(error.message);
    }
};
