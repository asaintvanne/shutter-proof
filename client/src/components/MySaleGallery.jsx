import axios from 'axios';
import { useEffect, useState } from 'react';
import useEth from "../contexts/EthContext/useEth";
import { toast } from 'react-toastify';
import { formatDate } from "../libs/format_date.js";
import { buildIPFSUrl } from "../libs/ipfs_helper.js";

function MySaleGallery() {

    const { state: { contract, artifactSBT, artifactSaleNFT, web3, accounts } } = useEth();

    const [photos, setPhotos] = useState({});
    const [prices, setPrices] = useState([]);
    const [isApproved, setApproved] = useState(false);

    useEffect(() => {
        const photosArray = [];
        let contractSBT;
        let contractExclusiveRightsNFT;
        contract.methods.getExclusiveRightsNFT().call({ from: accounts[0] })
            .then(contractExclusiveRightsNFTAddress => {
                contractExclusiveRightsNFT = new web3.eth.Contract(artifactSaleNFT.abi, contractExclusiveRightsNFTAddress);
                return contractExclusiveRightsNFT.methods.isApprovedForAll(accounts[0], contract.options.address).call();
            })
            .then(isShutterProofApproved => {
                setApproved(isShutterProofApproved);
            })
            .catch(error => {
                toast.error("Erreur lors de la récupération du contrat", {
                    position: toast.POSITION.TOP_LEFT
                });
                console.log(error);
            })
        ;

        if (isApproved) {
            contract.methods.getExclusiveRightsNFT().call({ from: accounts[0] })
                .then(contractExclusiveRightsNFTAddress => {
                    contractExclusiveRightsNFT = new web3.eth.Contract(artifactSaleNFT.abi, contractExclusiveRightsNFTAddress);
                    return contractExclusiveRightsNFT.getPastEvents("Transfer", {
                        filter: {to: accounts[0]},
                        fromBlock: 0,
                        toBlock: "latest",
                    });
                })
                .then(async (events) => {
                    for (let i = 0; i < events.length; i++) {
                        let tokenOwner = await contractExclusiveRightsNFT.methods.ownerOf(events[i].returnValues.tokenId).call();
                        if (accounts[0] === tokenOwner) {
                            let sbt = await contractExclusiveRightsNFT.methods.getSBT(events[i].returnValues.tokenId).call();
                            const price = await contractExclusiveRightsNFT.methods.getPrice(events[i].returnValues.tokenId).call();
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
        }
    }, [accounts]);

    const handlePriceChange = (e, photoId) => {
        if (/^\d+$|^$/.test(e.target.value)) {
            const newPrices = { ...prices };
            newPrices[photoId] = e.target.value;
            setPrices(newPrices);
        }
      };

    const sale = (e, photoId) => {
        if (prices[photoId] === undefined || prices[photoId] < 1) {
            toast.error("Le prix doit être renseigné et positif", {
                position: toast.POSITION.TOP_LEFT
            });
            return;
        } else {
            contract.methods.getExclusiveRightsNFT().call()
                .then(contractExclusiveRightsNFTAddress => {
                    const contractExclusiveRightsNFT = new web3.eth.Contract(artifactSaleNFT.abi, contractExclusiveRightsNFTAddress);
                    return contractExclusiveRightsNFT.methods.saleExclusiveRights(photoId, prices[photoId]).send({ from: accounts[0] });
                })
                .then(result => {
                    const newPhotos = {...photos};
                    newPhotos[photoId].price = prices[photoId];
                    setPhotos(newPhotos);
                    toast.success("La photo est mise en vente", {
                        position: toast.POSITION.TOP_LEFT
                    });
                })
                .catch(error => {
                    toast.error("Impossible de mettre la photo en vente", {
                        position: toast.POSITION.TOP_LEFT
                    });
                    console.log(error);
                })
            ;
        }
    };

    const unsale = (e, photoId) => {
        contract.methods.getExclusiveRightsNFT().call()
            .then(contractExclusiveRightsNFTAddress => {
                const contractExclusiveRightsNFT = new web3.eth.Contract(artifactSaleNFT.abi, contractExclusiveRightsNFTAddress);
                return contractExclusiveRightsNFT.methods.unsaleExclusiveRights(photoId).send({ from: accounts[0] });
            })
            .then(result => {
                const newPhotos = {...photos};
                newPhotos[photoId].price = 0;
                setPhotos(newPhotos);
                toast.success("La photo est retirée de la vente", {
                    position: toast.POSITION.TOP_LEFT
                });
            })
            .catch(error => {
                toast.error("Impossible de retirer la photo de la vente", {
                    position: toast.POSITION.TOP_LEFT
                });
                console.log(error);
            })
        ;
    };

    const approve = (e) => {
        contract.methods.getExclusiveRightsNFT().call()
            .then(contractExclusiveRightsNFTAddress => {
                const contractExclusiveRightsNFT = new web3.eth.Contract(artifactSaleNFT.abi, contractExclusiveRightsNFTAddress);
                return contractExclusiveRightsNFT.methods.setApprovalForAll(contract.options.address, true).send({ from: accounts[0] });
            })
            .then(result => {
                setApproved(true);
            })
            .catch(error => {
                toast.error("Impossible de retirer la photo de la vente", {
                    position: toast.POSITION.TOP_LEFT
                });
                console.log(error);
            })
        ;
    }

    return (
        <>
            {isApproved ?
                Object.keys(photos).map((i) => (
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
                                {
                                    photos[i].price === 0 ?
                                    <div>
                                        <input type="number" placeholder="Prix" onChange={(e) => handlePriceChange(e, photos[i].id)} min="0" value={prices[photos[i].id] || ''}></input>
                                        <button type="button" onClick={(e) => sale(e, photos[i].id)}>Mettre en vente</button>
                                    </div>
                                    :
                                    <div>
                                    <button type="button" onClick={(e) => unsale(e, photos[i].id)}>Retirer de la vente</button>&nbsp;<span>En vente pour {photos[i].price} wei</span>
                                    </div>
                                }

                            </div>
                        </div>
                    </div>
                ))
                :
                <main role="main" className="container">
                    <div className="jumbotron">
                        <div className="row">
                            <div className="col">
                                <p>Autoriser ShutterProof à céder vos droits si des utilisateurs souhaitent les aquérir aux prix que vous avez fixé.</p>
                                <button onClick={approve} className="btn btn-primary mt-1 btn-register">Autoriser</button>
                            </div>
                        </div>

                    </div>
                </main>
            }
        </>
    )
}

export default MySaleGallery