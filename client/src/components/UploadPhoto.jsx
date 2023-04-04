import axios from 'axios';
import { useState } from 'react';
import useEth from "../contexts/EthContext/useEth";
import { toast } from 'react-toastify';

import dotenv from 'react-dotenv';

function UploadPhoto() {
    const [fileImg, setFileImg] = useState(null);
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [formDisabled, setFormDisabled] = useState(false);

    const { state: { contract, artifactSBT, web3, accounts } } = useEth();

    const sendFileToIPFS = async (e) => {

        e.preventDefault();

        if (fileImg && title !== "" && desc !== "") {

            setFormDisabled(true);
            const formData = new FormData();
            formData.append("file", fileImg);
            axios({
                method: "post",
                url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                data: formData,
                headers: {
                    'pinata_api_key': dotenv.REACT_APP_PINATA_API_KEY,
                    'pinata_secret_api_key': dotenv.REACT_APP_PINATA_API_SECRET,
                    "Content-Type": "multipart/form-data"
                },
            })
            .then(result => {
                return axios({
                    method: "post",
                    url: "https://api.pinata.cloud/pinning/pinJsonToIPFS",
                    data: {
                        "title": title,
                        "description": desc,
                        "image": result.data.IpfsHash,
                        "author": accounts[0]
                    },
                    headers: {
                        'pinata_api_key': dotenv.REACT_APP_PINATA_API_KEY,
                        'pinata_secret_api_key': dotenv.REACT_APP_PINATA_API_SECRET,
                    },
                });
            })
            .then(async (result) => {
                const contractSBTAddress = await contract.methods.getPaternitySBT(accounts[0]).call({ from: accounts[0] });
                const contractSBT = new web3.eth.Contract(artifactSBT.abi, contractSBTAddress);
                return contractSBT.methods.mint(result.data.IpfsHash).send({ from: accounts[0] });
            })
            .then(result => {
                toast.success("La photo est authentifiée", {
                    position: toast.POSITION.TOP_LEFT
                });
            })
            .catch(error => {
                toast.error("Erreur lors de l'authentification de la photo", {
                    position: toast.POSITION.TOP_LEFT
                });
                console.log(error);
            })
            .finally(() => {
                setFormDisabled(false);
            })
            ;
        } else {
            toast.warning("Tous les champs doivent être correctement renseignés", {
                position: toast.POSITION.TOP_LEFT
            });
        }
    }

    return (
        <div className="jumbotron">
            <form onSubmit={sendFileToIPFS}>
                <div className="row">
                    <div className="col">
                        <input className='input-big' type="file" onChange={(e) => setFileImg(e.target.files[0])} required disabled={formDisabled} />
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <input className='input-big' type="text" onChange={(e) => setTitle(e.target.value)} placeholder="Titre" required value={title} disabled={formDisabled} />
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <textarea className='textarea-big' type="text" onChange={(e) => setDesc(e.target.value)} placeholder="Description" required value={desc} disabled={formDisabled} />
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <button className='btn btn-primary btn-big' type='submit' disabled={formDisabled}>Envoyer la photo</button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default UploadPhoto