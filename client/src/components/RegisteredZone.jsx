import {Routes, Route, Link} from "react-router-dom";
import useApp from "../contexts/AppContext/useApp";
import AccountInfo from './AccountInfo.jsx';
import MyGallery from "./MyGallery.jsx";
import MySaleGallery from "./MySaleGallery.jsx";
import SaleGallery from "./SaleGallery.jsx";
import UploadPhoto from './UploadPhoto.jsx';
import * as Roles from "../roles.js";
import { buildIPFSUrl } from "../libs/ipfs_helper.js";

function RegisteredZone() {

  const {state: {role} } = useApp();

  const RoutesComponent = () => {
    return (
      <Routes>
        <Route path="/" element={<h1>Bonjour</h1>} />
        {role === Roles.Photographer && <Route path="/upload" element={<UploadPhoto />} />}
        {role === Roles.Photographer && <Route path="/my-gallery" element={<MyGallery />} />}
        <Route path="/my-sale-gallery" element={<MySaleGallery />} />
        <Route path="/sale-gallery" element={<SaleGallery />} />
        <Route path="/*" element={<p>L'accès à cete page n'est pas autorisé.</p>} />
      </Routes>
    );
  };

    return (
        <>
            <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
                <Link to="/">
                    <img id="mini-logo" src={buildIPFSUrl("QmSNHq1zmmrQSqcjtzEJwwuYbBpUWYXRrkWRiMT7hTefQn")} alt="" />
                </Link>
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav mr-auto">
                        {
                        role === Roles.Photographer  &&
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="/" id="dropdown1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Mes photos</a>
                                <div className="dropdown-menu" aria-labelledby="dropdown1">
                                    <Link className="dropdown-item" to="/my-gallery">Ma galerie</Link>
                                    <Link className="dropdown-item" to="/upload">Ajouter une photo</Link>
                                </div>
                            </li>
                        }
                        
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="/" id="dropdown2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Achat/Vente</a>
                            <div className="dropdown-menu" aria-labelledby="dropdown2">
                                <Link className="dropdown-item" to="/sale-gallery">Acheter des photos</Link>
                                <Link className="dropdown-item" to="/my-sale-gallery">Vendre mes photos</Link>
                            </div>
                        </li>
                    </ul>
                    <div className="form-inline my-2 my-lg-0">
                        <AccountInfo />
                    </div>
                </div>
            </nav>

            <main role="main" className="container">
                <RoutesComponent />
            </main>
        </>
    )
}

export default RegisteredZone