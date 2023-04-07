import axios from 'axios';
import { useEffect, useState } from 'react';
import useEth from "../contexts/EthContext/useEth";
import { toast } from 'react-toastify';
import { formatDate } from "../libs/format_date.js";
import { buildIPFSUrl } from "../libs/ipfs_helper.js";

function SaleGallery() {

    const { state: { contract, artifactSBT, artifactSaleNFT, web3, accounts, deployTx } } = useEth();

    const [photos, setPhotos] = useState({});

    useEffect(() => {
        const photosArray = [];
        let contractSBT;
        let contractExclusiveRightsNFT;
        contract.methods.getExclusiveRightsNFT().call({ from: accounts[0] })
            .then(contractExclusiveRightsNFTAddress => {
                contractExclusiveRightsNFT = new web3.eth.Contract(artifactSaleNFT.abi, contractExclusiveRightsNFTAddress);
                return contractExclusiveRightsNFT.getPastEvents("Transfer", {
                    filter: {from: 0},
                    fromBlock: deployTx.blockNumber,
                    toBlock: "latest",
                });
            })
            .then(async (events) => {
                for (let i = 0; i < events.length; i++) {
                    const tokenOwner = await contractExclusiveRightsNFT.methods.ownerOf(events[i].returnValues.tokenId).call();
                    const price = await contractExclusiveRightsNFT.methods.getPrice(events[i].returnValues.tokenId).call();
                    if (tokenOwner !== accounts[0] && price > '0') {
                        try {
                            let sbt = await contractExclusiveRightsNFT.methods.getSBT(events[i].returnValues.tokenId).call();
                            contractSBT = new web3.eth.Contract(artifactSBT.abi, sbt.sbtAddress);
                            let urlHash = await contractSBT.methods.getToken(sbt.tokenId).call();
                            const authorAddress = await contractSBT.methods.getOwner().call();
                            const author = await contract.methods.getUser(authorAddress).call();
                            const block = await web3.eth.getBlock(events[i].blockNumber);
                            const json = await axios({
                                method: "get",
                                url: buildIPFSUrl(urlHash),
                            });
                            photosArray[events[i].returnValues['tokenId']] = {
                                id: events[i].returnValues['tokenId'],
                                title: json.data.title,
                                author: author.name,
                                description: json.data.description,
                                url: buildIPFSUrl(json.data.image),
                                date: formatDate(block.timestamp),
                                price: parseInt(price)
                            };
                        } catch (error) {
                            console.log(error);
                        }

                    }
                }
                setPhotos(photosArray);
            })
            .catch(error => {
                toast.error("Erreur lors de la récupération des photos", {
                    position: toast.POSITION.TOP_LEFT
                });
                console.log(error);
            })
        ;
    }, [accounts]);

    const buy = (e, photoId, price) => {
        contract.methods.buyExclusiveRights(photoId).send({from: accounts[0], value: price})
            .then(result => {
                const newPhotos = {...photos};
                delete newPhotos[photoId];
                setPhotos(newPhotos);
                toast.success("La photo est à vous !", {
                    position: toast.POSITION.TOP_LEFT
                });
            })
            .catch(error => {
                toast.error("Impossible d'acheter la photo", {
                    position: toast.POSITION.TOP_LEFT
                });
                console.log(error);
            })
        ;
    };

    return (
        <>
            <h1>Les photos à vendre</h1>
            {photos.length > 0 && Object.keys(photos).map((i) => (
                <div key={photos[i].id} className="jumbotron jumbotron-gallery">
                    <div className="row">
                        <div className="col-sm-4 text-center">
                            <a href={photos[i].url} target="_blank" rel="noreferrer">
                                <img key={photos[i].id} className='img-gallery img-fluid' src={photos[i].url} alt={photos[i].id} />
                            </a>
                        </div>
                        <div className="col-sm-8">
                            <h3>#{photos[i].id} {photos[i].title}</h3>
                            <h4>par {photos[i].author}</h4>
                            <p>{photos[i].description}</p>
                            <p>Date d'authentification : {photos[i].date}</p>
                            <div>
                                <button type="button" onClick={(e) => buy(e, photos[i].id, photos[i].price)}>Acheter</button>&nbsp;<span>En vente pour {photos[i].price} wei</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {photos.length === 0 && <p>Aucune photo n'est en vente.</p>}
        </>
    )
}

export default SaleGallery