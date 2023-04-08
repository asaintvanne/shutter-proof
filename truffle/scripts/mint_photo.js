const { contracts_build_directory } = require("../truffle-config");

const account = process.argv[4];
const ipfs_hash = process.argv[5];

module.exports = async function(callback) {
    await mintPhoto(artifacts);
    callback();
};

const mintPhoto = async (artifacts) => {
    const ShutterProof = artifacts.require('ShutterProof');
    const PaternitySBT = artifacts.require('PaternitySBT');
    const ShutterProofInstance = await ShutterProof.deployed();
    const user = await ShutterProofInstance.getUser.call(account);
    const PaternitySBTInstance = await PaternitySBT.at(user.sbt);

    try {
        await PaternitySBTInstance.mint(ipfs_hash, {from: account});
        console.log("MINT OK")
    } catch (error) {
        console.log("MINT KO");
        console.log(error.message);
    }
};