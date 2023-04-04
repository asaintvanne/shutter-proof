import axios from 'axios';
import { useEffect, useState } from 'react';
import useEth from "../contexts/EthContext/useEth";
import { toast } from 'react-toastify';
import { formatDate } from "../libs/format_date.js";

function MyGallery() {

    const { state: { contract, artifactSBT, web3, accounts } } = useEth();

    const [photos, setPhotos] = useState([]);

    /*
    useEffect(() => {
        let contractSBT;
        const photos = [];
        contract.methods.getPaternitySBT(accounts[0]).call({ from: accounts[0] })
            .then(async (contractSBTAddress) => {
                contractSBT = new web3.eth.Contract(artifactSBT.abi, contractSBTAddress);
                console.log(contractSBT, instance);
                return contractSBT.methods.balance().call();
            })
            .then(async (balance) => {
                const photos = [];
                for (let i = 0; i < balance; i++) {
                    const urlHash = await contractSBT.methods.getToken(i).call();
                    const json = await axios({
                        method: "get",
                        url: "https://ipfs.io/ipfs/" + urlHash,
                    });
                    photos.push({
                        id: i + 1,
                        title: json.data.title,
                        description: json.data.description,
                        url: "https://ipfs.io/ipfs/" + json.data.image
                    });
                }
                setPhotos(photos);
            })
            .catch(error => {
                toast.error("Erreur lors de la récupération des photos", {
                    position: toast.POSITION.TOP_LEFT
                });
                console.log(error);
            })
        ;
    }, []);
    */


    useEffect(() => {
        let contractSBT;
        const photos = [];
        contract.methods.getPaternitySBT(accounts[0]).call({ from: accounts[0] })
            .then(contractSBTAddress => {
                contractSBT = new web3.eth.Contract(artifactSBT.abi, contractSBTAddress);

                return contractSBT.getPastEvents("Mint", {
                    fromBlock: 0,
                    toBlock: "latest",
                });
            })
            .then(async (events) => {
                console.log(events);
                const photos = [];
                for (let i = 0; i < events.length; i++) {
                    const urlHash = await contractSBT.methods.getToken(events[i].returnValues[0]).call();
                    const block = await web3.eth.getBlock(events[i].blockNumber);
                    const json = await axios({
                        method: "get",
                        url: "https://ipfs.io/ipfs/" + urlHash,
                    });
                    photos.push({
                        id: events[i].returnValues[0],
                        title: json.data.title,
                        description: json.data.description,
                        url: "https://ipfs.io/ipfs/" + json.data.image,
                        date: formatDate(block.timestamp)
                    });
                }
                setPhotos(photos);
            })
            .catch(error => {
                toast.error("Erreur lors de la récupération des photos", {
                    position: toast.POSITION.TOP_LEFT
                });
                console.log(error);
            })
        ;
    }, []);

    return (
        <>
            {photos.map((photo) => (
                <div key={photo.id} className="jumbotron jumbotron-gallery">
                    <div className="row">
                        <div className="col-sm-4 text-center">
                            <a href={photo.url} target="_blank">
                                <img key={photo.id} className='img-gallery img-fluid' src={photo.url} alt={photo.id} rel="noreferrer" />
                            </a>
                        </div>
                        <div className="col-sm-8">
                            <h3>#{photo.id} {photo.title}</h3>
                            <p>{photo.description}</p>
                            <p>Date d'authentification : {photo.date}</p>
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}

export default MyGallery